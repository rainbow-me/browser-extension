import { IMessageSender } from '@rainbow-me/provider';

import { RainbowError, logger } from '~/logger';

/**
 * Validates that a message sender originates from within the extension.
 * Used to prevent cross-origin message handler bypass attacks where
 * malicious websites attempt to send messages to privileged handlers.
 *
 * @param sender - The message sender object containing URL and origin info
 * @param source - Identifier for logging purposes (e.g., 'messenger:wallet_action')
 * @returns true if the sender is from an internal extension URL
 */
export const isInternalOrigin = (
  sender: IMessageSender | undefined,
  source: string,
): boolean => {
  const extensionOrigin = chrome.runtime.getURL('');
  const senderUrl = sender?.url;
  const isInternal = senderUrl?.startsWith(extensionOrigin) ?? false;

  if (!isInternal) {
    logger.error(
      new RainbowError(`${source}: message received from invalid origin`, {
        cause: new Error(`Invalid origin: ${senderUrl ?? 'unknown'}`),
      }),
    );
  }

  return isInternal;
};
