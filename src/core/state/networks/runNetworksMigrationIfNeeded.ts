import buildTimeNetworks from 'static/data/networks.json';
import { logger } from '~/logger';

import { createStore } from '../internal/createStore';

import { NetworkState, networkStore } from './networks';
import { buildInitialUserPreferences } from './utils';

let isRainbowChainsReady = false;
let isUserChainsReady = false;
let isMigrationManagerReady = false;

export type NetworksStoreMigrationState = {
  didCompleteNetworksMigration: boolean;
};

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
              runNetworksMigrationIfNeeded('networksMigration');
            }
          };
        },
      },
    },
  );

export const runNetworksMigrationIfNeeded = (
  storeKey: 'networksMigration' | 'rainbowChains' | 'userChains',
) => {
  if (storeKey === 'rainbowChains') isRainbowChainsReady = true;
  if (storeKey === 'userChains') isUserChainsReady = true;
  if (storeKey === 'networksMigration') isMigrationManagerReady = true;

  if (isRainbowChainsReady && isUserChainsReady && isMigrationManagerReady) {
    const { didCompleteNetworksMigration } =
      networksStoreMigrationStore.getState();
    if (didCompleteNetworksMigration) {
      logger.debug('[networks] networks store migration already completed', {
        storeKey,
      });
      return;
    }

    logger.debug('[networks] initializing networks store');

    const initialState: NetworkState = {
      networks: buildTimeNetworks,
      ...buildInitialUserPreferences(),
    };

    networkStore.setState(initialState);
    networksStoreMigrationStore.setState({
      didCompleteNetworksMigration: true,
    });
  }
};
