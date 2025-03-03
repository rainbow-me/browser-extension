import { logger } from '~/logger';

import { createStore } from '../internal/createStore';

import { NetworksStoreMigrationState } from './types';

// Migration store
export const networksStoreMigrationStore =
  createStore<NetworksStoreMigrationState>(
    () => ({
      didCompleteNetworksMigration: false,
    }),
    {
      persist: {
        name: 'networksStoreMigration',
        version: 0,
        onRehydrateStorage: () => {
          return (_, error) => {
            if (!error) {
              // Import the runNetworksMigrationIfNeeded function dynamically to avoid circular dependencies
              import('./runNetworksMigrationIfNeeded')
                .then(({ runNetworksMigrationIfNeeded }) => {
                  runNetworksMigrationIfNeeded('networksMigration');
                })
                .catch(() => {
                  // Just log that there was an error without trying to pass the error object
                  logger.debug(
                    '[networks] Failed to import runNetworksMigrationIfNeeded',
                  );
                });
            }
          };
        },
      },
    },
  );

// Migration state tracking
let isRainbowChainsReady = false;
let isUserChainsReady = false;
let isMigrationManagerReady = false;

// Getter functions
export const getIsRainbowChainsReady = () => isRainbowChainsReady;
export const getIsUserChainsReady = () => isUserChainsReady;
export const getIsMigrationManagerReady = () => isMigrationManagerReady;

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

// Reset migration state (useful for testing)
export const resetMigrationState = () => {
  isRainbowChainsReady = false;
  isUserChainsReady = false;
  isMigrationManagerReady = false;
};
