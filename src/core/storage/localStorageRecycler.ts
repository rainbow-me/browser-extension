import { RainbowError, logger } from '~/logger';

const OBSOLETE_KEYS = ['rainbow.wagmi', '137-allowList'];

/**
 * Cleanup obsolete storage keys
 */
export async function localStorageRecycler(): Promise<void> {
  try {
    const storage = await chrome.storage.local.get(OBSOLETE_KEYS);
    if (Object.keys(storage).length === 0) {
      logger.debug('No obsolete storage keys found');
      return;
    }

    const beforeSize = Object.values(storage).reduce(
      (acc, value) => acc + JSON.stringify(value).length / 1024,
      0,
    );

    await chrome.storage.local.remove(OBSOLETE_KEYS);

    logger.info('Storage cleanup completed', {
      removedKeys: OBSOLETE_KEYS,
      freedSpaceKB: beforeSize.toFixed(2),
    });
  } catch (error) {
    logger.error(new RainbowError('Failed to clean up obsolete storage'), {
      message: (error as Error)?.message,
    });
  }
}
