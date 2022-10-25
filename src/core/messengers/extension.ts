import { CallbackFunction, createMessenger } from './internal/createMessenger';

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
  async send<TPayload, TResponse>(
    topic: string,
    payload: TPayload,
    { id }: { id?: number | string } = {},
  ) {
    return new Promise<TResponse>((resolve, reject) => {
      const listener = (response: {
        topic: string;
        id: number | string;
        payload: { response: TResponse; error: Error };
      }) => {
        if (response.topic !== `< ${topic}`) return;
        if (typeof id !== 'undefined' && response.id !== id) return;
        if (!response.payload) return;

        chrome.runtime.onMessage.removeListener(listener);

        const { response: response_, error } = response.payload;
        if (error) reject(new Error(error.message));
        resolve(response_);
      };
      chrome.runtime.onMessage.addListener(listener);

      chrome.runtime.sendMessage({
        topic: `> ${topic}`,
        payload,
        id,
      });
    });
  },
  reply<TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>,
  ) {
    const listener = (
      message: { topic: string; payload: TPayload; id: number },
      sender: chrome.runtime.MessageSender,
    ) => {
      if (topic !== '*' && message.topic !== `> ${topic}`) return;
      if (topic === '*' && message.topic.startsWith('<')) return;

      const repliedTopic = message.topic.replace('>', '<');

      chrome.tabs
        .query({ active: true, lastFocusedWindow: true })
        .then(([tab]) => {
          if (!tab.id) throw new Error('No active tab.');
          callback(message.payload, {
            id: message.id,
            sender,
            topic: message.topic,
          })
            .then((response) =>
              // @ts-expect-error – `tab.id` is defined
              chrome.tabs.sendMessage(tab.id, {
                topic: repliedTopic,
                payload: { response },
                id: message.id,
              }),
            )
            .catch((error_) => {
              // Errors do not serialize properly over `chrome.runtime.sendMessage`, so
              // we are manually serializing it to an object.
              const error: Record<string, unknown> = {};
              for (const key of Object.getOwnPropertyNames(error_)) {
                error[key] = (<Error>error_)[<keyof Error>key];
              }
              chrome.runtime.sendMessage({
                topic: repliedTopic,
                payload: { error },
                id: message.id,
              });
            });
        });
      return true;
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  },
});
