import { onBFCacheRestore, onBFUnload } from '~/core/utils/bfcacheMessaging';
import { detectScriptType } from '~/core/utils/detectScriptType';

import {
  CallbackFunction,
  Messenger,
  ReplyMessage,
  SendMessage,
  createMessenger,
} from './createMessenger';
import { isValidReply } from './isValidReply';
import { isValidSend } from './isValidSend';

let activeTab: chrome.tabs.Tab;

function getActiveTabs() {
  if (!chrome.tabs) return Promise.resolve([]);
  return chrome.tabs
    .query({ active: true, lastFocusedWindow: true })
    .then(([tab]) => {
      if (!tab?.url?.startsWith('http') && activeTab) return [activeTab];
      activeTab = tab;
      return [tab];
    });
}

function sendMessage<TPayload>(
  message: SendMessage<TPayload>,
  { tabId }: { tabId?: number } = {},
) {
  if (!tabId) {
    chrome?.runtime?.sendMessage?.(message);
  } else {
    chrome.tabs?.sendMessage(tabId, message);
  }
}

function createTabMessenger() {
  return createMessenger({
    available: Boolean(
      typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.tabs,
    ),
    name: 'tabMessenger',
    _listeners: {},
    stopListeners() {
      Object.values(this._listeners).forEach((listeners) => {
        listeners.forEach((listener) => {
          chrome.runtime.onMessage.removeListener(listener);
        });
      });
    },
    migrateListeners(newMessenger: Messenger) {
      // populate new messenger with listeners from old messenger
      newMessenger._listeners = this._listeners;

      // reattach listeners to chrome.runtime.onMessage
      Object.values(this._listeners).forEach((listeners) => {
        listeners.forEach((listener) => {
          chrome.runtime.onMessage.removeListener(listener);
          chrome.runtime.onMessage.addListener(listener);
        });
      });
    },
    async send<TPayload, TResponse>(
      topic: string,
      payload: TPayload,
      { id }: { id?: number | string } = {},
    ) {
      return new Promise<TResponse>((resolve, reject) => {
        const listener = (
          message: ReplyMessage<TResponse>,
          _: chrome.runtime.MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => {
          if (!isValidReply<TResponse>({ id, message, topic })) return;

          chrome.runtime.onMessage?.removeListener(listener);

          const { response: response_, error } = message.payload;
          if (error) reject(new Error(error.message));
          resolve(response_);
          sendResponse({});
          return true;
        };
        chrome.runtime.onMessage?.addListener(listener);

        getActiveTabs().then(([tab]) => {
          sendMessage({ topic: `> ${topic}`, payload, id }, { tabId: tab?.id });
        });
      });
    },
    reply<TPayload, TResponse>(
      topic: string,
      callback: CallbackFunction<TPayload, TResponse>,
    ) {
      if (this._listeners[topic]) {
        this._listeners[topic].forEach((listener) => {
          chrome.runtime.onMessage.removeListener(listener);
        });
        this._listeners[topic] = [];
      } else {
        this._listeners[topic] = [];
      }

      const listener = async (
        message: SendMessage<TPayload>,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => {
        if (!isValidSend({ message, topic })) return;

        const repliedTopic = message.topic.replace('>', '<');

        const [tab] = await getActiveTabs();

        try {
          const response = await callback(message.payload, {
            id: message.id,
            sender,
            topic: message.topic,
          });
          sendMessage(
            {
              topic: repliedTopic,
              payload: { response },
              id: message.id,
            },
            { tabId: tab?.id },
          );
        } catch (error_) {
          // Errors do not serialize properly over `chrome.runtime.sendMessage`, so
          // we are manually serializing it to an object.
          const error: Record<string, unknown> = {};
          for (const key of Object.getOwnPropertyNames(error_)) {
            error[key] = (<Error>error_)[<keyof Error>key];
          }
          sendMessage(
            {
              topic: repliedTopic,
              payload: { error },
              id: message.id,
            },
            {
              tabId: tab?.id,
            },
          );
        }
        sendResponse({});
        return true;
      };

      chrome.runtime.onMessage?.addListener(listener);
      this._listeners[topic].push(listener);

      return () => {
        chrome.runtime.onMessage?.removeListener(listener);
        const index = this._listeners[topic].indexOf(listener);
        if (index > -1) {
          this._listeners[topic].splice(index, 1);
        }
      };
    },
  });
}

/**
 * Creates a "tab messenger" that can be used to communicate between
 * scripts where `chrome.tabs` & `chrome.runtime` is defined.
 *
 * Compatible connections:
 * - ❌ Popup <-> Inpage
 * - ❌ Background <-> Inpage
 * - ❌ Background <-> Popup
 * - ✅ Popup <-> Content Script
 * - ✅ Background <-> Content Script
 * - ❌ Content Script <-> Inpage
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#2af765a8378c4f08a1663d9bfcb60ad9
 */
export let tabMessenger = createTabMessenger();

// this is only needed in content script
if (detectScriptType() === 'contentScript') {
  onBFCacheRestore(() => {
    const newMessenger = createTabMessenger();
    tabMessenger.migrateListeners(newMessenger);
    tabMessenger = newMessenger;
  });

  onBFUnload(() => {
    tabMessenger.stopListeners();
  });
}
