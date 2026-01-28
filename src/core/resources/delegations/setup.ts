import { configure as configureDelegationClient } from '@rainbow-me/rainbow-delegation';
import type { AsyncStorageInterface } from '@storesjs/stores';

import { platformHttp } from '~/core/network/platform';
import { useCurrentAddressStore } from '~/core/state';
import { createExtensionStoreOptions } from '~/core/state/_internal';
import { useNetworkStore } from '~/core/state/networks/networks';
import { logger } from '~/logger';

export function setupDelegationClient() {
  const { sync, storage } = createExtensionStoreOptions({
    storageKey: 'delegation',
    version: 1,
  });

  configureDelegationClient({
    platformClient: platformHttp,
    logger: logger,
    chains: Object.values(
      useNetworkStore.getState().getBackendSupportedChains(),
    ),
    currentAddress: ($) => $(useCurrentAddressStore).currentAddress,
    storeOptions: {
      sync,
      storage: storage as AsyncStorageInterface,
      shouldEnable: () => true,
    },
  });
}
