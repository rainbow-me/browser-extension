import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import { isNativePopup } from '~/core/utils/tabs';
import { RainbowError, logger } from '~/logger';

import { buildTimeNetworks } from './constants';
import {
  areAllStoresReady,
  networksStoreMigrationStore,
  setMigrationManagerReady,
  setRainbowChainsReady,
  setUserChainsReady,
} from './migration';
import { NetworkState } from './types';
import { buildInitialUserPreferences } from './utils';

export const runNetworksMigrationIfNeeded = async (
  storeKey: 'networksMigration' | 'rainbowChains' | 'userChains',
) => {
  if (storeKey === 'rainbowChains') {
    setRainbowChainsReady(true);
  }
  if (storeKey === 'userChains') {
    setUserChainsReady(true);
  }
  if (storeKey === 'networksMigration') {
    setMigrationManagerReady(true);
  }

  if (areAllStoresReady()) {
    if (networksStoreMigrationStore.getState().didCompleteNetworksMigration) {
      console.log('[networks] Migration already completed');
      return;
    }

    const isPopup = (await isNativePopup()) as boolean;

    console.log('[networks] Context detection:', {
      isPopup,
      location: window.location.href,
    });

    // If we're not in background, just update our state to match storage but don't migrate
    if (isPopup) {
      console.log('[networks] In popup context, exi for background migration');
      return;
    }

    console.log('[networks] initializing networks store');

    // Get the current state from the stores
    const { rainbowChains } = useRainbowChainsStore.getState();
    const { userChains, userChainsOrder } = useUserChainsStore.getState();

    try {
      const { networkStore } = await import('./networks');

      // Initialize the network store with the current state
      const initialState: NetworkState = {
        networks: buildTimeNetworks,
        ...buildInitialUserPreferences(
          buildTimeNetworks,
          rainbowChains,
          userChains,
          userChainsOrder,
        ),
      };

      networkStore.setState(initialState);
      networksStoreMigrationStore.setState({
        didCompleteNetworksMigration: true,
      });
    } catch (error) {
      logger.error(new RainbowError('Failed to migrate networks store'), {
        error,
      });
    }
  }
};
