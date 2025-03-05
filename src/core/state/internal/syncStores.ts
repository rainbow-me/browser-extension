import { LocalStorage } from '~/core/storage';

import * as stores from '../index';

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
