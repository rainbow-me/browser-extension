import { createRainbowStore } from '../internal/createRainbowStore';

import { runNetworksMigrationIfNeeded } from './runNetworksMigrationIfNeeded';
import { NetworksStoreMigrationState } from './types';

const IS_TESTING = process.env.IS_TESTING === 'true';

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
          if (!error && !IS_TESTING) {
            runNetworksMigrationIfNeeded('networksMigration');
          }
        };
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
