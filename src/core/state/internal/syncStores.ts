import { isEmpty, isEqual } from 'lodash';

import { LocalStorage } from '~/core/storage';
import { RainbowError, logger } from '~/logger';

import * as stores from '../index';
import { networksStoreMigrationStore } from '../networks/migration';
import { networkStore } from '../networks/networks';
import { NetworkState } from '../networks/types';

import {
  defaultDeserializeState,
  defaultSerializeState,
} from './createRainbowStore';
import { StoreWithPersist } from './createStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStoreWithPersist(store: any): store is StoreWithPersist<unknown> {
  return (
    store &&
    typeof store === 'function' &&
    'persist' in store &&
    typeof store.persist === 'object' &&
    store.persist !== null &&
    'getOptions' in store.persist &&
    typeof store.persist.getOptions === 'function' &&
    'rehydrate' in store.persist &&
    typeof store.persist.rehydrate === 'function'
  );
}

async function syncStore({ store }: { store: StoreWithPersist<unknown> }) {
  const persistOptions = store.persist.getOptions();
  const storageName = persistOptions.name;

  const listener = async (changedStore: StoreWithPersist<unknown>) => {
    if (!storageName) return;

    if (changedStore === undefined) {
      const state = store.getInitialState();
      const version = persistOptions.version;
      const serializedState = persistOptions?.serialize?.({ state, version });
      await LocalStorage.set(storageName, serializedState);
    }
    store.persist.rehydrate();
  };

  if (storageName) {
    LocalStorage.listen(storageName, listener);
  }
}

export function syncStores() {
  Object.values(stores).forEach((store) => {
    if (isStoreWithPersist(store)) {
      syncStore({ store });
    }
  });
}

const deserializeNetworkState = (state: string) => {
  return defaultDeserializeState<NetworkState>(state, true);
};

const serializeNetworkState = (state: NetworkState, version: number) => {
  return defaultSerializeState(state, version, true);
};

export function syncNetworksStore(context: 'popup' | 'background') {
  // Track the last synced state to prevent circular updates
  let lastSyncedState: string | null = null;
  // For popup: track if we've received the first sync from background
  let hasReceivedFirstSync = false;

  // Common function to handle state updates from LocalStorage
  const handleStorageUpdate = (state: string) => {
    // Skip if we're seeing our own update
    if (state === lastSyncedState) return;

    try {
      logger.debug(
        `${context}: detected state change from ${
          context === 'popup' ? 'background' : 'popup'
        }: ${JSON.stringify(state)}`,
      );
      const { state: deserializedState } = deserializeNetworkState(state);
      logger.debug(
        `${context}: deserialized state: ${JSON.stringify(deserializedState)}`,
      );
      if (isEmpty(deserializedState)) return;

      // Update last synced state before setting state to prevent loops
      lastSyncedState = state;
      networkStore.setState(deserializedState);

      // For popup: after receiving first sync from background, setup subscription
      if (context === 'popup' && !hasReceivedFirstSync) {
        logger.debug(
          'popup: received first sync from background, now setting up subscription',
        );
        hasReceivedFirstSync = true;
        networkStore.subscribe(handleStoreUpdate);
      }
    } catch (error) {
      logger.error(
        new RainbowError(
          `${context}: error deserializing network state: ${error}`,
        ),
      );
    }
  };

  // Common function to handle networkStore changes
  const handleStoreUpdate = (state: NetworkState, prevState: NetworkState) => {
    if (isEqual(state, prevState)) return;

    const serializedState = serializeNetworkState(state, 1);
    // Skip if we're seeing our own update
    if (serializedState === lastSyncedState) return;

    logger.debug(
      `${context}: sending state update to ${
        context === 'popup' ? 'background' : 'popup'
      }`,
    );
    // Update last synced state before setting storage to prevent loops
    lastSyncedState = serializedState;
    LocalStorage.set('networks.networks', serializedState);
  };

  // Set up LocalStorage listener for both contexts
  LocalStorage.listen<string>('networks.networks', handleStorageUpdate);

  // For background context only, handle migration and subscription
  // Popup will wait for first sync from background before subscribing
  if (context === 'background') {
    const initialMigrationState =
      networksStoreMigrationStore.getState().didCompleteNetworksMigration;

    if (initialMigrationState) {
      logger.debug(
        'background: migration already complete, subscribing to network store changes',
      );
      networkStore.subscribe(handleStoreUpdate);
    } else {
      logger.debug('background: waiting for network migration to complete');
      networksStoreMigrationStore.subscribe((state) => {
        if (state.didCompleteNetworksMigration) {
          logger.debug(
            'background: migration complete, subscribing to network store changes',
          );
          networkStore.subscribe(handleStoreUpdate);
        }
      });
    }
  }
}
