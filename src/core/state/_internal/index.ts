import { BaseStoreOptions, SyncOption } from 'stores';

import { ChromeExtensionSyncEngine } from './chromeExtensionSyncEngine';
import { ChromeStorageAdapter } from './chromeStorageAdapter';

type CustomExtensionOptions = {
  area?: 'local' | 'session' | 'sync' | 'managed';
  useRainbowNamingSchema?: boolean;
};

export const createExtensionStoreOptions = <T>({
  area = 'local',
  useRainbowNamingSchema = true,
  storageKey,
  ...options
}: BaseStoreOptions<T, Partial<T>, Promise<void>> &
  CustomExtensionOptions): BaseStoreOptions<T, Partial<T>, Promise<void>> => {
  if (!storageKey) {
    throw new Error('storageKey is required');
  }
  const storage = new ChromeStorageAdapter({
    area,
    namespace: useRainbowNamingSchema ? 'rainbow.zustand.' : undefined,
  });
  const syncEngine = new ChromeExtensionSyncEngine({ storage });

  return {
    ...options,
    storage,
    storageKey,
    sync: { engine: syncEngine } as unknown as T extends Record<string, unknown>
      ? SyncOption<T>
      : never,
  };
};
