import { configure } from '@rainbow-me/delegation';
import type { AsyncStorageInterface } from '@storesjs/stores';

import { platformHttp } from '~/core/network/platform';
import { useCurrentAddressStore } from '~/core/state';
import { createExtensionStoreOptions } from '~/core/state/_internal';
import { useNetworkStore } from '~/core/state/networks/networks';
import { logger } from '~/logger';

/**
 * Configure the delegation SDK. Call once at startup in both popup and background.
 */
export function setupDelegationClient(): void {
  const { sync, storage } = createExtensionStoreOptions({
    storageKey: 'delegation',
    version: 1,
  });

  configure({
    platformClient: platformHttp,
    logger: logger,
    chains: Object.values(
      useNetworkStore.getState().getBackendSupportedChains(),
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentAddress: ($: any) => $(useCurrentAddressStore).currentAddress,
    storeOptions: {
      sync,
      storage: storage as AsyncStorageInterface,
      shouldEnable: () => true,
    },
  });
}
