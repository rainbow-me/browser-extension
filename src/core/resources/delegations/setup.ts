import type { AsyncStorageInterface } from '@storesjs/stores';

import { platformHttp } from '~/core/network/platform';
import { useCurrentAddressStore } from '~/core/state';
import { createExtensionStoreOptions } from '~/core/state/_internal';
import { useNetworkStore } from '~/core/state/networks/networks';
import { logger } from '~/logger';

/**
 * TEMPORARY: This module stores delegation config separately to enable lazy-loading.
 *
 * MIGRATION PATH (when ready to switch back to direct imports):
 *
 * 1. Add direct import at top:
 *    import { configure as configureDelegationClient } from '@rainbow-me/rainbow-delegation'
 *
 * 2. Replace setupDelegationClient() body with direct call:
 *    export function setupDelegationClient() {
 *      const { sync, storage } = createExtensionStoreOptions({
 *        storageKey: 'delegation',
 *        version: 1,
 *      });
 *
 *      configureDelegationClient({
 *        platformClient: platformHttp,
 *        logger: logger,
 *        chains: Object.values(
 *          useNetworkStore.getState().getBackendSupportedChains(),
 *        ),
 *        currentAddress: ($) => $(useCurrentAddressStore).currentAddress,
 *        storeOptions: {
 *          sync,
 *          storage: storage as AsyncStorageInterface,
 *          shouldEnable: () => true,
 *        },
 *      });
 *    }
 *
 * 3. Delete getDelegationConfig() function (no longer needed)
 * 4. Delete delegationConfig variable (no longer needed)
 */

// Store config in a separate module to avoid webpack tracing imports
// This module doesn't import lazyDelegation, so webpack won't include the SDK
// Using any for config type since it's temporary and will be removed during migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let delegationConfig: any = null;

export function setupDelegationClient() {
  const { sync, storage } = createExtensionStoreOptions({
    storageKey: 'delegation',
    version: 1,
  });

  delegationConfig = {
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
  };
}

/**
 * TEMPORARY: Exported for lazy-loading wrapper
 * Remove this function when migrating to direct imports
 */
export function getDelegationConfig() {
  return delegationConfig;
}
