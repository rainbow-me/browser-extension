import { ScriptType, detectScriptType } from '../utils/detectScriptType';
import { isInternalOrigin } from '../utils/isInternalOrigin';

import { bridgeMessenger } from './internal/bridge';
import { CallbackOptions, Messenger } from './internal/createMessenger';
import { extensionMessenger } from './internal/extension';
import { tabMessenger } from './internal/tab';
import { windowMessenger } from './internal/window';

const messengersForConnection = {
  'popup <-> inpage': bridgeMessenger,
  'background <-> inpage': bridgeMessenger,
  'background <-> popup': extensionMessenger,
  'popup <-> contentScript': tabMessenger,
  'background <-> contentScript': tabMessenger,
  'contentScript <-> inpage': windowMessenger,
} as const;

type InitializeMessengerArgs = {
  /** The script type we want to set a connection for. */
  connect: ScriptType;
};

/**
 * Wraps a messenger to enforce origin validation on all reply handlers.
 * Only allows messages from extension URLs (popup, background pages).
 */
function withOriginValidation(messenger: Messenger): Messenger {
  return {
    ...messenger,
    reply<TPayload, TResponse>(
      topic: string,
      callback: (
        payload: TPayload,
        options: CallbackOptions,
      ) => Promise<TResponse>,
    ) {
      return messenger.reply<TPayload, TResponse>(
        topic,
        async (payload, options) => {
          if (!isInternalOrigin(options.sender, `messenger:${topic}`)) {
            return { error: 'Invalid origin' } as TResponse;
          }
          return callback(payload, options);
        },
      );
    },
  };
}

export function initializeMessenger({ connect }: InitializeMessengerArgs) {
  const source = detectScriptType();
  const connections = [
    `${source} <-> ${connect}`,
    `${connect} <-> ${source}`,
  ] as (keyof typeof messengersForConnection)[];
  const connection = connections.find((c) => c in messengersForConnection);
  if (!connection)
    throw new Error(
      `No messenger found for connection ${source} <-> ${connect}.`,
    );

  const messenger = messengersForConnection[connection];

  if (source === 'background' && connect === 'popup') {
    return withOriginValidation(messenger);
  }

  return messenger;
}
