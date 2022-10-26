import { detectScriptType } from '../utils/detectScriptType';

import { extensionMessenger } from './extension';
import { createMessenger } from './internal/createMessenger';
import { windowMessenger } from './window';

const messenger = extensionMessenger.available
  ? extensionMessenger
  : windowMessenger;

/**
 * Creates a "bridge messenger" that can be used to communicate between
 * scripts where there isn't a direct messaging connection (ie. inpage <-> background).
 *
 * Compatible entries:
 * - ✅ Background
 * - ✅ Popup
 * - ✅ Content Script
 * - ✅ Inpage
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#68d4a6dce7dd4ca8b587ac1beba2ac6f
 */
export const bridgeMessenger = createMessenger({
  available: messenger.available,
  name: 'bridgeMessenger',
  async send(topic, payload, { id } = {}) {
    // The background script cannot send messages to the content script via
    // `chrome.runtime.sendMessage`, so we must use `chrome.tabs.sendMessage` instead.
    if (!windowMessenger.available) {
      const [activeTab] = await chrome.tabs.query({ active: true });
      if (!activeTab.id) throw new Error('No active tab.');
      return chrome.tabs.sendMessage(activeTab.id, { topic, payload, id });
    }
    return messenger.send(topic, payload, { id });
  },
  reply(topic, callback) {
    return messenger.reply(topic, callback);
  },
});

export function setupBridgeMessengerRelay() {
  if (detectScriptType() !== 'contentScript') {
    throw new Error(
      '`setupBridgeMessengerRelay` is only supported in Content Scripts.',
    );
  }

  // e.g. inpage -> content script -> background
  windowMessenger.reply<unknown, unknown>(
    '*',
    async (payload, { topic, id }) => {
      if (!topic) return;

      const topic_ = topic.replace('> ', '');
      const response = await extensionMessenger.send<unknown, unknown>(
        topic_,
        payload,
        { id },
      );
      return response;
    },
  );

  // e.g. background -> content script -> inpage
  extensionMessenger.reply<unknown, unknown>(
    '*',
    async (payload, { topic, id }) => {
      if (!topic) return;

      const response = await windowMessenger.send<unknown, unknown>(
        topic,
        payload,
        { id },
      );
      return response;
    },
  );
}
