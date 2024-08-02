import { RequestArguments } from '@rainbow-me/provider';

import {
  CallbackFunction,
  ReplyMessage,
  SendMessage,
  createMessenger,
} from './createMessenger';
import { isValidReply } from './isValidReply';
import { isValidSend } from './isValidSend';

let activeTab: chrome.tabs.Tab;

const shouldNotifyAllTabs = (method: string) =>
  [
    'eth_chainId',
    'eth_accounts',
    'eth_sendTransaction',
    'eth_signTransaction',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'wallet_watchAsset',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain',
    'eth_requestAccounts',
  ].includes(method);

function getCurrentActiveTab() {
  if (!chrome.tabs) return Promise.resolve([]);
  return chrome.tabs
    .query({ active: true, lastFocusedWindow: true })
    .then(([tab]) => {
      if (!tab?.url?.startsWith('http') && activeTab) return [activeTab];
      activeTab = tab;
      return [tab];
    });
}

function getAllTabs() {
  if (!chrome.tabs) return Promise.resolve([]);
  return chrome.tabs.query({});
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

      const message = { topic: `> ${topic}`, payload, id };

      if (shouldNotifyAllTabs((payload as RequestArguments)?.method)) {
        sendMessage(message, { tabId: undefined });
      } else {
        getCurrentActiveTab().then(([tab]) =>
          sendMessage(message, { tabId: tab?.id }),
        );
      }
    });
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>,
  ) {
    const listener = async (
      message: SendMessage<TPayload>,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => {
      if (!isValidSend({ message, topic })) return;

      const repliedTopic = message.topic.replace('>', '<');

      let tabs: chrome.tabs.Tab[] = [];

      if (shouldNotifyAllTabs((message.payload as RequestArguments)?.method)) {
        tabs = await getAllTabs();
      } else {
        tabs = await getCurrentActiveTab();
      }

      try {
        const response = await callback(message.payload, {
          id: message.id,
          sender,
          topic: message.topic,
        });

        for (const tab of tabs) {
          sendMessage(
            {
              topic: repliedTopic,
              payload: { response },
              id: message.id,
            },
            {
              tabId: tab?.id,
            },
          );
        }
      } catch (error_) {
        // Errors do not serialize properly over `chrome.runtime.sendMessage`, so
        // we are manually serializing it to an object.
        const error: Record<string, unknown> = {};
        for (const key of Object.getOwnPropertyNames(error_)) {
          error[key] = (<Error>error_)[<keyof Error>key];
        }
        for (const tab of tabs) {
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
      }
      sendResponse({});
      return true;
    };
    chrome.runtime.onMessage?.addListener(listener);
    return () => chrome.runtime.onMessage?.removeListener(listener);
  },
});
