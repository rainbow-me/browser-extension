import create, { Mutate, StoreApi } from 'zustand/vanilla';
import { persist, PersistOptions } from 'zustand/middleware';
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
