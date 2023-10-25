import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export enum featureFlagTypes {
  full_watching_wallets = 'full_watching_wallets',
  hw_wallets_enabled = 'hw_wallets_enabled',
  command_k_internal_shortcuts_enabled = 'command_k_internal_shortcuts_enabled',
  new_tab_bar_enabled = 'new_tab_bar_enabled',
  nfts_enabled = 'nfts_enabled',
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
      hw_wallets_enabled: true,
      command_k_internal_shortcuts_enabled: false,
      new_tab_bar_enabled: true,
      nfts_enabled: false,
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
      version: 5,
    },
  },
);

export const useFeatureFlagsStore = create(featureFlagsStore);
