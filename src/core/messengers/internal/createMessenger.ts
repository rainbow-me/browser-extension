export type CallbackOptions = {
  sender: chrome.runtime.MessageSender;
  topic: string;
};

export type CallbackFunction<TPayload, TResponse> = (
  payload: TPayload,
  callbackOptions: CallbackOptions,
) => Promise<TResponse>;

export type Source = 'background' | 'content' | 'inpage' | 'popup';

export type Messenger = {
  available: boolean;
  name: string;
  send: <TPayload, TResponse>(
    topic: string,
    payload: TPayload,
  ) => Promise<TResponse>;
  reply: <TPayload, TResponse>(
    topic: string,
    callback: CallbackFunction<TPayload, TResponse>,
  ) => () => void;
};

/**
 * Creates a generic messenger that can be used to send and receive messages between extension scripts.
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#6c19ef14227d468e8e9bc232a367f035
 */
export function createMessenger(messenger: Messenger) {
  return messenger;
}
