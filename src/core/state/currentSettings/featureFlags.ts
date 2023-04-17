import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export enum featureFlagTypes {
  full_watching_wallets = 'full_watching_wallets',
}
export type FeatureFlagTypes = keyof typeof featureFlagTypes;

export interface FeatureFlagsStore {
  featureFlags: { [key in FeatureFlagTypes]: boolean };
  setFeatureFlag: (key: FeatureFlagTypes, value: boolean) => void;
}

export const featureFlagsStore = createStore<FeatureFlagsStore>(
  (set, get) => ({
    featureFlags: { full_watching_wallets: false },
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
      version: 1,
    },
  },
);

export const useFeatureFlagsStore = create(featureFlagsStore);
