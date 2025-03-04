import { create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';
import { Mutate, StoreApi } from 'zustand/vanilla';

import { noopStorage, persistStorage } from './persistStorage';

type Initializer<TState> = Parameters<typeof persist<TState>>[0];
export type StoreWithPersist<TState> = Mutate<
  StoreApi<TState>,
  [['zustand/persist', unknown]]
> & {
  initializer: Initializer<TState>;
};

export function createStore<TState>(
  initializer: Initializer<TState>,
  { persist: persistOptions }: { persist?: PersistOptions<TState> } = {},
) {
  const name = `rainbow.zustand.${persistOptions?.name}`;

  // Create a properly typed storage
  const storage =
    persistOptions?.storage ||
    createJSONStorage<TState>(() =>
      persistOptions ? persistStorage : noopStorage,
    );

  return create<TState>()(
    persist(initializer, {
      ...persistOptions,
      name,
      storage,
    }),
  );
}
