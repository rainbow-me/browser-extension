import {
  CallbackFunction,
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
    chrome.runtime.sendMessage(message);
  } else {
    chrome.tabs.sendMessage(tabId, message);
  }
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
export const tabMessenger = createMessenger({
  available: Boolean(
    typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.tabs,
  ),
  name: 'tabMessenger',
  async send<TPayload, TResponse>(
    topic: string,
    payload: TPayload,
    { id }: { id?: number | string } = {},
  ) {
    return new Promise<TResponse>((resolve, reject) => {
      const listener = (message: ReplyMessage<TResponse>) => {
        if (!isValidReply<TResponse>({ id, message, topic })) return;

        chrome.runtime.onMessage.removeListener(listener);

        const { response: response_, error } = message.payload;
        if (error) reject(new Error(error.message));
        resolve(response_);
      };
      chrome.runtime.onMessage.addListener(listener);

      getActiveTabs().then(([tab]) => {
        sendMessage({ topic: `> ${topic}`, payload, id }, { tabId: tab?.id });
      });
    });
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>,
  ) {
    const listener = (
      message: SendMessage<TPayload>,
      sender: chrome.runtime.MessageSender,
    ) => {
      if (!isValidSend({ message, topic })) return;

      const repliedTopic = message.topic.replace('>', '<');

      getActiveTabs().then(([tab]) => {
        callback(message.payload, {
          id: message.id,
          sender,
          topic: message.topic,
        })
          .then((response) =>
            sendMessage(
              {
                topic: repliedTopic,
                payload: { response },
                id: message.id,
              },
              { tabId: tab?.id },
            ),
          )
          .catch((error_) => {
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
          });
      });
      return true;
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  },
});
