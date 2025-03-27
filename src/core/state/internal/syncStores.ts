import { isEmpty, isEqual } from 'lodash';

import { LocalStorage } from '~/core/storage';

import * as stores from '../index';
import { networksStoreMigrationStore } from '../networks/migration';
import { networkStore } from '../networks/networks';
import { NetworkState } from '../networks/types';

import {
  defaultDeserializeState,
  defaultSerializeState,
} from './createRainbowStore';
import { StoreWithPersist } from './createStore';

async function syncStore({ store }: { store: StoreWithPersist<unknown> }) {
  if (!store.persist) return;

  const persistOptions = store.persist.getOptions();
  const storageName = persistOptions.name || '';

  const listener = async (changedStore: StoreWithPersist<unknown>) => {
    if (changedStore === undefined) {
      // Retrieve the default state from the store initializer.
      const state = store.initializer(
        () => undefined,
        () => null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      );
      const version = persistOptions.version;
      const newStore = persistOptions.serialize?.({ state, version });
      await LocalStorage.set(storageName, newStore);
    }
    store.persist.rehydrate();
  };

  LocalStorage.listen(storageName, listener);
}

export function syncStores() {
  Object.values(stores).forEach((store) => {
    if (typeof store === 'function') return;
    if (store.persist) syncStore({ store: store as StoreWithPersist<unknown> });
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
      console.log(
        `${context}: detected state change from ${
          context === 'popup' ? 'background' : 'popup'
        }: `,
        state,
      );
      const { state: deserializedState } = deserializeNetworkState(state);
      console.log(`${context}: deserialized state: `, deserializedState);
      if (isEmpty(deserializedState)) return;

      // Update last synced state before setting state to prevent loops
      lastSyncedState = state;
      networkStore.setState(deserializedState);

      // For popup: after receiving first sync from background, setup subscription
      if (context === 'popup' && !hasReceivedFirstSync) {
        console.log(
          'popup: received first sync from background, now setting up subscription',
        );
        hasReceivedFirstSync = true;
        networkStore.subscribe(handleStoreUpdate);
      }
    } catch (error) {
      console.error(`${context}: error deserializing network state: `, error);
    }
  };

  // Common function to handle networkStore changes
  const handleStoreUpdate = (state: NetworkState, prevState: NetworkState) => {
    if (isEqual(state, prevState)) return;

    const serializedState = serializeNetworkState(state, 1);
    // Skip if we're seeing our own update
    if (serializedState === lastSyncedState) return;

    console.log(
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
      console.log(
        'background: migration already complete, subscribing to network store changes',
      );
      networkStore.subscribe(handleStoreUpdate);
    } else {
      console.log('background: waiting for network migration to complete');
      networksStoreMigrationStore.subscribe((state) => {
        if (state.didCompleteNetworksMigration) {
          console.log(
            'background: migration complete, subscribing to network store changes',
          );
          networkStore.subscribe(handleStoreUpdate);
        }
      });
    }
  }
}
