import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

export enum featureFlagTypes {
  full_watching_wallets = 'full_watching_wallets',
  command_k_internal_shortcuts_enabled = 'command_k_internal_shortcuts_enabled',
  rewards_scheduled_drop = 'rewards_scheduled_drop',
  atomic_swaps_enabled = 'atomic_swaps_enabled',
  delegation_enabled = 'delegation_enabled',
}
export type FeatureFlagTypes = keyof typeof featureFlagTypes;

export interface FeatureFlagsStore {
  featureFlags: {
    [K in FeatureFlagTypes]: K extends
      | 'atomic_swaps_enabled'
      | 'delegation_enabled'
      ? boolean | null
      : boolean;
  };
  setFeatureFlag: (key: FeatureFlagTypes, value: boolean | null) => void;
}

export const useFeatureFlagsStore = createBaseStore<FeatureFlagsStore>(
  (set, get) => ({
    featureFlags: {
      full_watching_wallets: false,
      command_k_internal_shortcuts_enabled: false,
      rewards_scheduled_drop: false,
      atomic_swaps_enabled: null,
      delegation_enabled: null,
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
    version: 11, // Bump version to handle migration from boolean to boolean | null
    merge(_persistedState, currentState) {
      const persistedState = _persistedState as FeatureFlagsStore; // fair to assume no one is gonna mess with this in inspect element
      // Migrate atomic_swaps_enabled and delegation_enabled from boolean to boolean | null
      // Preserve boolean values if they exist (user explicitly set them), otherwise use null (use remote)
      const migratedFeatureFlags = {
        ...currentState.featureFlags,
        ...persistedState.featureFlags,
        // For atomic_swaps_enabled and delegation_enabled, preserve boolean values if set, otherwise use null
        atomic_swaps_enabled:
          persistedState.featureFlags.atomic_swaps_enabled !== undefined &&
          typeof persistedState.featureFlags.atomic_swaps_enabled === 'boolean'
            ? persistedState.featureFlags.atomic_swaps_enabled
            : null,
        delegation_enabled:
          persistedState.featureFlags.delegation_enabled !== undefined &&
          typeof persistedState.featureFlags.delegation_enabled === 'boolean'
            ? persistedState.featureFlags.delegation_enabled
            : null,
      };
      return {
        ...currentState,
        ...persistedState,
        featureFlags: migratedFeatureFlags,
      };
    },
  }),
);
