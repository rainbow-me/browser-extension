import { configure } from '@rainbow-me/delegation';

import { platformHttp } from '~/core/network/platform';
import { useCurrentAddressStore } from '~/core/state';
import { getSyncedStorage } from '~/core/state/_internal';
import { logger } from '~/logger';

/**
 * Configure the delegation SDK. Call once at startup in both popup and background.
 */
export function setupDelegationClient(): void {
  const { storage, syncEngine } = getSyncedStorage({
    area: 'local',
    storageKeyPrefix: 'rainbow.zustand.',
  });

  configure({
    platformClient: platformHttp,
    logger: logger.createServiceLogger(logger.DebugContext.delegation),
    getCurrentAddress: ($) => $(useCurrentAddressStore).currentAddress,
    storeOptions: {
      sync: { engine: syncEngine },
      storage,
      shouldEnable: () => true,
    },
  });
}
