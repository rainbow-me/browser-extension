import { LocalStorage } from '~/core/storage';

import * as stores from '../index';

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

/**
 * Checks if a store requires manual synchronization via syncStores().
 * Stores created with createRainbowStore require manual sync.
 * Stores created with createBaseStore + createExtensionStoreOptions have automatic sync and don't require manual sync.
 */
export function requiresManualSync(store: StoreWithPersist<unknown>): boolean {
  try {
    const persistOptions = store.persist.getOptions();
    const storage = persistOptions.storage;

    // Check if storage has the required methods
    if (
      !storage ||
      typeof storage !== 'object' ||
      typeof storage.setItem !== 'function'
    ) {
      return false;
    }

    // Stores created with createRainbowStore include 'lazyPersist' in their setItem function
    // If setItem includes lazyPersist, it requires manual sync (createRainbowStore)
    const setItemCode = storage.setItem.toString();
    return setItemCode.includes('lazyPersist');
  } catch {
    // If getOptions fails, the store can't use automatic sync, so it requires manual sync
    return false;
  }
}

async function syncStore({ store }: { store: StoreWithPersist<unknown> }) {
  const persistOptions = store.persist.getOptions();
  const storageName = persistOptions.name;

  const listener = async (newValue: unknown) => {
    if (!storageName) return;

    if (newValue === undefined) {
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

/**
 * Syncs stores that need manual synchronization between processes.
 * Only stores exported from '../index' are synced here.
 * Stores using createExtensionStoreOptions have automatic sync and are skipped.
 */
export function syncStores() {
  Object.values(stores).forEach((store) => {
    if (isStoreWithPersist(store)) {
      // Skip stores that don't require manual sync (they have automatic sync)
      if (!requiresManualSync(store)) {
        return;
      }
      syncStore({ store });
    }
  });
}
