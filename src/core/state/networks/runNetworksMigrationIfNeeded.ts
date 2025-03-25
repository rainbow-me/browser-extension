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

  // Only proceed if all required stores are ready
  if (areAllStoresReady()) {
    const { didCompleteNetworksMigration } =
      networksStoreMigrationStore.getState();
    if (didCompleteNetworksMigration) {
      logger.debug('[networks] networks store migration already completed', {
        storeKey,
      });
      return;
    }

    logger.debug('[networks] initializing networks store');

    // Get the current state from the stores
    const { rainbowChains } = useRainbowChainsStore.getState();
    const { userChains, userChainsOrder } = useUserChainsStore.getState();

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

    // We'll import the networkStore dynamically to avoid circular dependencies
    // This is a bit of a hack, but it's necessary to break the circular dependency
    import('./networks').then(({ networkStore }) => {
      console.log('setting initialState', initialState);
      networkStore.setState(initialState);
      console.log('setting didCompleteNetworksMigration to true');
      networksStoreMigrationStore.setState({
        didCompleteNetworksMigration: true,
      });
    });
  }
};
