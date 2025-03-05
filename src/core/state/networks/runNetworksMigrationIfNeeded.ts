import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import { logger } from '~/logger';

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

// Re-export for backward compatibility
export { networksStoreMigrationStore };

// This function needs to be defined here to avoid circular dependencies
export const runNetworksMigrationIfNeeded = (
  storeKey: 'networksMigration' | 'rainbowChains' | 'userChains',
) => {
  // Update the appropriate flag based on which store is ready
  if (storeKey === 'rainbowChains') {
    setRainbowChainsReady(true);
  }
  if (storeKey === 'userChains') {
    setUserChainsReady(true);
  }
  if (storeKey === 'networksMigration') {
    setMigrationManagerReady(true);
  }

  console.log('runNetworksMigrationIfNeeded', {
    storeKey,
    areAllStoresReady: areAllStoresReady(),
  });

  // Only proceed if all required stores are ready
  if (areAllStoresReady()) {
    const { didCompleteNetworksMigration } =
      networksStoreMigrationStore.getState();
    if (didCompleteNetworksMigration) {
      console.log('networks store migration already completed', {
        storeKey,
      });
      logger.debug('[networks] networks store migration already completed', {
        storeKey,
      });
      return;
    }

    console.log('initializing networks store');
    logger.debug('[networks] initializing networks store');

    // Get the current state from the stores
    const { rainbowChains } = useRainbowChainsStore.getState();
    const { userChains, userChainsOrder } = useUserChainsStore.getState();

    console.log('rainbowChains', rainbowChains);
    console.log('userChains', userChains);
    console.log('userChainsOrder', userChainsOrder);

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

    console.log('initialState', initialState);

    // We'll import the networkStore dynamically to avoid circular dependencies
    // This is a bit of a hack, but it's necessary to break the circular dependency
    import('./networks').then(({ networkStore }) => {
      networkStore.setState(initialState);
      console.log('networkStore setState happened');
      networksStoreMigrationStore.setState({
        didCompleteNetworksMigration: true,
      });
      console.log('networksStoreMigrationStore marking as true');
    });
  }
};
