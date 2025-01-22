import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export enum featureFlagTypes {
  full_watching_wallets = 'full_watching_wallets',
  command_k_internal_shortcuts_enabled = 'command_k_internal_shortcuts_enabled',
  custom_rpc = 'custom_rpc',
  degen_mode = 'degen_mode',
}
export type FeatureFlagTypes = keyof typeof featureFlagTypes;

export interface FeatureFlagsStore {
  featureFlags: { [key in FeatureFlagTypes]: boolean };
  setFeatureFlag: (key: FeatureFlagTypes, value: boolean) => void;
}

export const featureFlagsStore = createStore<FeatureFlagsStore>(
  (set, get) => ({
    featureFlags: {
      full_watching_wallets: false,
      command_k_internal_shortcuts_enabled: true,
      custom_rpc: true,
      degen_mode: false,
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
  {
    persist: {
      name: 'featureFlagsStore',
      version: 11,
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
    },
  },
);

export const useFeatureFlagsStore = create(featureFlagsStore);
