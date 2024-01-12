import create from 'zustand';

import { isNativePopup } from '~/core/utils/tabs';

import { createStore } from '../internal/createStore';

export interface NavRestorationStore {
  clearLastPage: () => Promise<void>;
  lastPage?: string;
  setLastPage: (lastPage: string) => Promise<void>;
  lastState?: Record<string, string>;
  setLastState: (lastState: Record<string, string>) => Promise<void>;
  setShouldRestoreNavigation: (should: boolean) => Promise<void>;
  shouldRestoreNavigation: boolean;
}

export const navRestorationStore = createStore<NavRestorationStore>(
  (set) => ({
    clearLastPage: async () => {
      const isPopup = await isNativePopup();
      if (isPopup) {
        set({ lastPage: undefined });
      }
    },
    lastPage: undefined,
    setLastPage: async (lastPage) => {
      const isPopup = await isNativePopup();
      if (isPopup && lastPage !== '/') {
        set({ lastPage });
      }
    },
    lastState: undefined,
    setLastState: async (lastState) => {
      const isPopup = await isNativePopup();
      if (isPopup && !!lastState && Object.keys(lastState)?.length) {
        set({ lastState });
      }
    },
    setShouldRestoreNavigation: async (shouldRestoreNavigation) => {
      const isPopup = await isNativePopup();
      if (isPopup) {
        set({ shouldRestoreNavigation });
      }
    },
    shouldRestoreNavigation: false,
  }),
  {
    persist: {
      name: 'navRestoration',
      version: 0,
    },
  },
);

export const useNavRestorationStore = create(navRestorationStore);
