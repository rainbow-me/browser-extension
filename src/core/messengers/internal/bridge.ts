import { detectScriptType } from '../../utils/detectScriptType';

import { createMessenger } from './createMessenger';
import { tabMessenger } from './tab';
import { windowMessenger } from './window';

const messenger = tabMessenger.available ? tabMessenger : windowMessenger;

/**
 * Creates a "bridge messenger" that can be used to communicate between
 * scripts where there isn't a direct messaging connection (ie. inpage <-> background).
 *
 * Compatible connections:
 * - ✅ Popup <-> Inpage
 * - ✅ Background <-> Inpage
 * - ❌ Background <-> Popup
 * - ❌ Popup <-> Content Script
 * - ❌ Background <-> Content Script
 * - ❌ Content Script <-> Inpage
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#68d4a6dce7dd4ca8b587ac1beba2ac6f
 */
export const bridgeMessenger = createMessenger({
  available: messenger.available,
  name: 'bridgeMessenger',
  async send(topic, payload, { id } = {}) {
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
      const response = await tabMessenger.send<unknown, unknown>(
        topic_,
        payload,
        { id },
      );
      return response;
    },
  );

  // e.g. background -> content script -> inpage
  tabMessenger.reply<unknown, unknown>('*', async (payload, { topic, id }) => {
    if (!topic) return;

    const topic_: string = topic.replace('> ', '');
    const response = await windowMessenger.send<unknown, unknown>(
      topic_,
      payload,
      { id },
    );
    return response;
  });
}
