import { useRainbowChainsStore } from '~/core/state/rainbowChains';
import { useUserChainsStore } from '~/core/state/userChains';
import { detectScriptType } from '~/core/utils/detectScriptType';
import { RainbowError, logger } from '~/logger';

import { buildTimeNetworks } from './constants';
import {
  areAllStoresReady,
  setMigrationManagerReady,
  setRainbowChainsReady,
  setUserChainsReady,
  useNetworksStoreMigrationStore,
} from './migration';
import { useNetworkStore } from './networks';
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
    if (
      useNetworksStoreMigrationStore.getState().didCompleteNetworksMigration
    ) {
      logger.debug('[networks] Migration already completed');
      return;
    }

    logger.debug('[networks] detectScriptType');

    const scriptType = detectScriptType();

    logger.debug('[networks] Context detection:', {
      scriptType,
    });

    // If we're not in background, just update our state to match storage but don't migrate
    if (scriptType !== 'background') {
      logger.debug(
        '[networks] In popup context, exiting for background migration',
      );
      return;
    }

    logger.debug('[networks] initializing networks store');

    // Get the current state from the stores
    const { rainbowChains } = useRainbowChainsStore.getState();
    const { userChains, userChainsOrder } = useUserChainsStore.getState();

    try {
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

      useNetworkStore.setState(initialState);
      useNetworksStoreMigrationStore.setState({
        didCompleteNetworksMigration: true,
      });
    } catch (error) {
      logger.error(new RainbowError('Failed to migrate networks store'), {
        error,
      });
    }
  }
};
