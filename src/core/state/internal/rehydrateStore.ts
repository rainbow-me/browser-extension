import { StoreWithPersist } from './createStore';

export async function rehydrateStore({
  store,
}: {
  store: StoreWithPersist<unknown>;
}) {
  return await store.persist.rehydrate();
}
