import { createRainbowStore } from '../internal/createRainbowStore';

import { NetworksStoreMigrationState } from './types';

// Migration state tracking
let isRainbowChainsReady = false;
let isUserChainsReady = false;
let isMigrationManagerReady = false;

// Getter functions
export const getIsRainbowChainsReady = () => isRainbowChainsReady;
export const getIsUserChainsReady = () => isUserChainsReady;

// Setter functions
export const setRainbowChainsReady = (value: boolean) => {
  isRainbowChainsReady = value;
};

export const setUserChainsReady = (value: boolean) => {
  isUserChainsReady = value;
};

export const setMigrationManagerReady = (value: boolean) => {
  isMigrationManagerReady = value;
};

// Check if all required stores are ready
export const areAllStoresReady = () => {
  return isRainbowChainsReady && isUserChainsReady && isMigrationManagerReady;
};

// Migration function with lazy imports to avoid circular dependency
export async function runNetworksMigrationIfNeeded(
  storeKey: 'networksMigration' | 'rainbowChains' | 'userChains',
) {
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
      // Lazy import to avoid circular dependency
      const { logger } = await import('~/logger');
      logger.debug('[networks] Migration already completed');
      return;
    }

    // Lazy import to avoid circular dependency
    const { detectScriptType } = await import('~/core/utils/detectScriptType');
    const { logger } = await import('~/logger');

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

    // Lazy imports to avoid circular dependency
    const { useRainbowChainsStore } = await import('../rainbowChains');
    const { useUserChainsStore } = await import('../userChains');
    const { useNetworkStore } = await import('./networks');
    const { buildTimeNetworks } = await import('./constants');
    const { buildInitialUserPreferences } = await import('./utils');
    const { RainbowError } = await import('~/logger');

    // Get the current state from the stores
    const { rainbowChains } = useRainbowChainsStore.getState();
    const { userChains, userChainsOrder } = useUserChainsStore.getState();

    try {
      // Initialize the network store with the current state
      const initialState = {
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
}

export const useNetworksStoreMigrationStore =
  createRainbowStore<NetworksStoreMigrationState>(
    () => ({
      didCompleteNetworksMigration: false,
    }),
    {
      storageKey: 'networksStoreMigration',
      version: 0,
      onRehydrateStorage: () => {
        return async (_, error) => {
          if (!error) {
            runNetworksMigrationIfNeeded('networksMigration');
          }
        };
      },
    },
  );
