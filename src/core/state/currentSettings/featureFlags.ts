import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

export enum featureFlagTypes {
  full_watching_wallets = 'full_watching_wallets',
  command_k_internal_shortcuts_enabled = 'command_k_internal_shortcuts_enabled',
  rewards_scheduled_drop = 'rewards_scheduled_drop',
}
export type FeatureFlagTypes = keyof typeof featureFlagTypes;

export interface FeatureFlagsStore {
  featureFlags: { [key in FeatureFlagTypes]: boolean };
  setFeatureFlag: (key: FeatureFlagTypes, value: boolean) => void;
}

export const useFeatureFlagsStore = createBaseStore<FeatureFlagsStore>(
  (set, get) => ({
    featureFlags: {
      full_watching_wallets: false,
      command_k_internal_shortcuts_enabled: false,
      rewards_scheduled_drop: false,
    },
    setFeatureFlag: (key, value) => {
      const { featureFlags } = get();
      const newFeatureFlags = {
        ...featureFlags,
        [key]: value,
      };
      set({ featureFlags: newFeatureFlags });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'featureFlagsStore',
    version: 10,
    merge(_persistedState, currentState) {
      const persistedState = _persistedState as FeatureFlagsStore; // fair to assume no one is gonna mess with this in inspect element
      return {
        ...currentState,
        ...persistedState,
        featureFlags: {
          ...currentState.featureFlags,
          ...persistedState.featureFlags,
        },
      };
    },
  }),
);
