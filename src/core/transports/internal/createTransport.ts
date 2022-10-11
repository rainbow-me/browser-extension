import { Messenger } from '~/core/messengers';
import { CallbackOptions } from '~/core/messengers/internal/createMessenger';

/**
 * Creates a generic transport that can be used to send and receive messages between extension scripts
 * under a given topic & set of types.
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#3b63e155df6a4b71b0e6e74f7a2c416b
 */
export function createTransport<TPayload, TResponse>({
  messenger,
  topic,
}: {
  messenger: Messenger;
  topic: string;
}) {
  if (!messenger.available) {
    console.error(
      `Messenger "${messenger.name}" is not available in this context.`,
    );
  }
  return {
    async send(payload: TPayload) {
      return messenger.send<TPayload, TResponse>(topic, payload);
    },
    async reply(
      callback: (
        payload: TPayload,
        callbackOptions: CallbackOptions,
      ) => Promise<TResponse>,
    ) {
      messenger.reply(topic, callback);
    },
  };
}
