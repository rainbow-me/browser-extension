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
  // for the popup, we just need to listen to LocalStorage changes for the networks.networks key and rehydrate the store
  if (context === 'popup') {
    LocalStorage.listen<string>('networks.networks', (state) => {
      try {
        console.log('detected state change from backround script: ', state);
        const { state: deserializedState } = deserializeNetworkState(state);
        console.log('deserialized state: ', deserializedState);
        if (isEmpty(deserializedState)) return;
        networkStore.setState(deserializedState);
      } catch (error) {
        console.error('error deserializing network state: ', error);
      }
    });
    return;
  } else {
    const subscriber = () =>
      networkStore.subscribe((state, prevState) => {
        if (isEqual(state, prevState)) return;
        LocalStorage.set('networks.networks', serializeNetworkState(state, 1));
      });

    const initialMigrationState =
      networksStoreMigrationStore.getState().didCompleteNetworksMigration;
    if (initialMigrationState) {
      return subscriber();
    } else {
      networksStoreMigrationStore.subscribe((state) => {
        if (state.didCompleteNetworksMigration) {
          return subscriber();
        }
      });
    }
  }
}
