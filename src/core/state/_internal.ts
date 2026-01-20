import { BaseStoreOptions, SyncOption } from '@storesjs/stores';
import { AreaName, createSyncedChromeStorage } from '@storesjs/stores/chrome';

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
    storageKeyPrefix: useRainbowNamingSchema ? 'rainbow.zustand.' : '', // undefined uses the default prefix, but we want none
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
  storageKeyPrefix: string | undefined;
}): SyncedStorage {
  const key = buildStorageKey(options.area, options.storageKeyPrefix);
  const cached = storageCache.get(key);
  if (cached) return cached;

  const syncedStorage = createSyncedChromeStorage(options);
  storageCache.set(key, syncedStorage);
  return syncedStorage;
}

function buildStorageKey(area: AreaName, storageKeyPrefix: string | undefined) {
  if (!storageKeyPrefix) return area;
  return `${area}.${storageKeyPrefix}`;
}
