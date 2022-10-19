import { CallbackFunction, createMessenger } from './internal/createMessenger';

type SendResponseArgs<TResponse, TError> =
  | {
      response: TResponse;
      error?: never;
    }
  | {
      response?: never;
      error: TError;
    };

/**
 * Creates an "extension messenger" that can be used to communicate between
 * scripts where `chrome.runtime` is defined.
 *
 * Compatibile entries:
 * - ✅ Background
 * - ✅ Popup
 * - ✅ Content Script
 * - ❌ Inpage
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#2af765a8378c4f08a1663d9bfcb60ad9
 */
export const extensionMessenger = createMessenger({
  available: Boolean(typeof chrome !== 'undefined' && chrome.runtime?.id),
  name: 'extensionMessenger',
  async send(topic, payload) {
    const { response, error } = await chrome.runtime.sendMessage({
      topic,
      payload,
    });
    if (error) throw new Error(error.message);
    return response;
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>,
  ) {
    const listener = (
      message: { topic: string; payload: TPayload },
      sender: chrome.runtime.MessageSender,
      sendResponse: (
        response: SendResponseArgs<TResponse, Record<string, unknown>>,
      ) => void,
    ) => {
      if (topic !== '*' && message.topic !== topic) return;
      callback(message.payload, {
        sender,
        topic: message.topic,
      })
        .then((response) => sendResponse({ response }))
        .catch((error_) => {
          // Errors do not serialize properly over `chrome.runtime.sendMessage`, so
          // we are manually serializing it to an object.
          const error: Record<string, unknown> = {};
          for (const key of Object.getOwnPropertyNames(error_)) {
            error[key] = (<Error>error_)[<keyof Error>key];
          }
          sendResponse({ error });
        });
      return true;
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  },
});
