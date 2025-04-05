import { PersistOptions, persist } from 'zustand/middleware';
import create, { Mutate, StoreApi } from 'zustand/vanilla';

import { noopStorage, persistStorage } from './persistStorage';

type Initializer<TState> = Parameters<typeof persist<TState>>[0];
export type StoreWithPersist<TState> = Mutate<
  StoreApi<TState>,
  [['zustand/persist', unknown]]
> & {
  initializer: Initializer<TState>;
};

/**
 * @deprecated Use `createRainbowStore` instead.
 * Creates a store with persistence.
 * @param initializer - The initializer function for the store.
 * @param persistOptions - The persistence options for the store.
 * @returns A store with persistence.
 */
export function createStore<TState>(
  initializer: Initializer<TState>,
  { persist: persistOptions }: { persist?: PersistOptions<TState> } = {},
) {
  const name = `rainbow.zustand.${persistOptions?.name}`;
  return Object.assign(
    create(
      persist(initializer, {
        ...persistOptions,
        name,
        getStorage: () => (persistOptions ? persistStorage : noopStorage),
      }),
    ),
    { initializer },
  );
}
