import z from 'zod';

const PERF_LABEL = 'Storage migration';

export async function migrateStorage(): Promise<void> {
  console.time(PERF_LABEL);
  await Promise.all(
    Object.entries(MIGRATION_MAP).map(async ([oldKey, migrate]) => {
      if (!migrate) return;

      const result = await chrome.storage.local.get(oldKey);
      const oldValue = result[oldKey];
      if (oldValue !== undefined && oldValue !== null) {
        try {
          const [newKey, newValue] = migrate(oldKey, String(oldValue));
          await chrome.storage.local.set({ [newKey]: newValue });
          await chrome.storage.local.remove(oldKey);
        } catch {
          console.warn(`Migration '${oldKey}' failed`);
        }
      }
    }),
  );
  console.timeEnd(PERF_LABEL);
}

function wrapStorageSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    state: schema,
    version: z.number(),
  });
}

const MIGRATION_MAP: Record<
  string,
  ((key: string, value: string) => [string, unknown]) | undefined
> = {
  // Existing migrations
  'rainbow.zustand.isDefaultWallet': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ isDefaultWallet: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:isDefaultWallet', parsedValue.state.isDefaultWallet];
  },
  'rainbow.zustand.sound': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ soundsEnabled: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:isSoundEnabled', parsedValue.state.soundsEnabled];
  },

  // Phase 1: Simple boolean stores
  'rainbow.zustand.analyticsDisabled': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ analyticsDisabled: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return [
      'settings:isAnalyticsDisabled',
      parsedValue.state.analyticsDisabled,
    ];
  },
  'rainbow.zustand.developerTools': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ developerToolsEnabled: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return [
      'settings:isDeveloperToolsEnabled',
      parsedValue.state.developerToolsEnabled,
    ];
  },
  'rainbow.zustand.hideAssetBalances': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ hideAssetBalances: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return [
      'settings:isHideAssetBalances',
      parsedValue.state.hideAssetBalances,
    ];
  },
  'rainbow.zustand.hideSmallBalances': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ hideSmallBalances: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return [
      'settings:isHideSmallBalances',
      parsedValue.state.hideSmallBalances,
    ];
  },
  'rainbow.zustand.testnetMode': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ testnetMode: z.boolean() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:isTestnetMode', parsedValue.state.testnetMode];
  },

  // Phase 2: Simple value stores
  'rainbow.zustand.autoLockTimer': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ autoLockTimer: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:autoLockTimer', parsedValue.state.autoLockTimer];
  },
  'rainbow.zustand.currentChainId': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ currentChainId: z.number() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:currentChainId', parsedValue.state.currentChainId];
  },
  'rainbow.zustand.currentCurrency': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ currentCurrency: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:currentCurrency', parsedValue.state.currentCurrency];
  },
  'rainbow.zustand.defaultTxSpeed': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ defaultTxSpeed: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:defaultTxSpeed', parsedValue.state.defaultTxSpeed];
  },
  'rainbow.zustand.tabNavigation': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ selectedTab: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:selectedTab', parsedValue.state.selectedTab];
  },

  // Phase 3: Medium complexity stores
  'rainbow.zustand.connectedToHardhat': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({
        connectedToHardhat: z.boolean(),
        connectedToHardhatOp: z.boolean(),
      }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    // Note: This only migrates the main connectedToHardhat property
    // connectedToHardhatOp will use its default value
    return [
      'settings:isConnectedToHardhat',
      parsedValue.state.connectedToHardhat,
    ];
  },
  'rainbow.zustand.currentLanguage': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ currentLanguage: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:currentLanguage', parsedValue.state.currentLanguage];
  },

  // Phase 4: High complexity stores
  'rainbow.zustand.currentAddress': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ currentAddress: z.string() }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:currentAddress', parsedValue.state.currentAddress];
  },
  'rainbow.zustand.featureFlagsStore': (k, v) => {
    const storageSchema = wrapStorageSchema(
      z.object({ featureFlags: z.record(z.string(), z.boolean()) }),
    );
    const parsedValue = storageSchema.parse(JSON.parse(v));

    return ['settings:featureFlags', parsedValue.state.featureFlags];
  },
};
