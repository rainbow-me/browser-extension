import { RainbowError, logger } from '~/logger';

type Sender = { url?: string } | undefined;

export const isInternalOrigin = (sender: Sender, source: string): boolean => {
  const extensionOrigin = chrome.runtime.getURL('');
  const senderUrl = sender?.url;
  const isInternal = senderUrl?.startsWith(extensionOrigin);

  if (!isInternal) {
    logger.error(
      new RainbowError(`${source}: message received from invalid origin`, {
        cause: new Error(`Invalid origin: ${senderUrl ?? 'unknown'}`),
      }),
    );
  }

  return Boolean(isInternal);
};
