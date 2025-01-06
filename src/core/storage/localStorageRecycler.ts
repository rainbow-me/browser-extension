import * as Sentry from '@sentry/browser';

import { RainbowError, logger } from '~/logger';

// Define as regular array instead of readonly
const OBSOLETE_KEYS = ['rainbow.wagmi'];

/**
 * Cleanup obsolete storage keys
 */
export async function localStorageRecycler(): Promise<void> {
  try {
    // Check if any obsolete keys exist
    const storage = await chrome.storage.local.get(OBSOLETE_KEYS);
    if (Object.keys(storage).length === 0) {
      logger.debug('No obsolete storage keys found');
      return;
    }

    // Get storage size before cleanup for logging
    const beforeSize = Object.values(storage).reduce(
      (acc, value) => acc + JSON.stringify(value).length / 1024,
      0,
    );

    // Remove obsolete keys
    await chrome.storage.local.remove(OBSOLETE_KEYS);

    logger.info('Storage cleanup completed', {
      removedKeys: OBSOLETE_KEYS,
      freedSpaceKB: beforeSize.toFixed(2),
    });
  } catch (error) {
    Sentry.captureException(error);
    logger.error(new RainbowError('Failed to clean up obsolete storage'), {
      message: (error as Error)?.message,
    });
  }
}
