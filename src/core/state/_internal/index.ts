import { BaseStoreOptions, SyncOption } from 'stores';
import { AreaName, createSyncedChromeStorage } from 'stores/plugins/chrome';

type CustomExtensionOptions = {
  area?: AreaName;
  useRainbowNamingSchema?: boolean;
};

type SyncedStorage = ReturnType<typeof createSyncedChromeStorage>;

const storageCache = new Map<string, SyncedStorage>();

export const createExtensionStoreOptions = <S>({
  area = 'local',
  useRainbowNamingSchema = true,
  storageKey,
  ...options
}: BaseStoreOptions<S, Partial<S>, Promise<void>> &
  CustomExtensionOptions): BaseStoreOptions<S, Partial<S>, Promise<void>> => {
  if (!storageKey) {
    throw new Error('[createExtensionStoreOptions]: storageKey is required');
  }

  const { storage, syncEngine } = getSyncedStorage({
    area,
    namespace: useRainbowNamingSchema ? 'rainbow.zustand.' : undefined,
  });

  return {
    ...options,
    storage,
    storageKey,
    sync: (options.sync && typeof options.sync === 'object'
      ? { ...options.sync, engine: syncEngine }
      : { engine: syncEngine }) as unknown as S extends Record<string, unknown>
      ? SyncOption<S>
      : never,
  };
};

function getSyncedStorage(options: {
  area: AreaName;
  namespace: string | undefined;
}): SyncedStorage {
  const key = buildStorageKey(options.area, options.namespace);
  const cached = storageCache.get(key);
  if (cached) return cached;

  const syncedStorage = createSyncedChromeStorage(options);
  storageCache.set(key, syncedStorage);
  return syncedStorage;
}

function buildStorageKey(area: AreaName, namespace: string | undefined) {
  if (!namespace) return area;
  return `${area}.${namespace}`;
}
