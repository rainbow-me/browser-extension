import create from 'zustand';

import { isNativePopup } from '~/core/utils/tabs';

import { createStore } from '../internal/createStore';

export interface NavRestorationStore {
  lastPage?: string;
  setLastPage: (lastPage: string) => Promise<void>;
}

export const navRestorationStore = createStore<NavRestorationStore>(
  (set) => ({
    lastPage: undefined,
    setLastPage: async (lastPage) => {
      const isPopup = await isNativePopup();
      if (isPopup) {
        set({ lastPage });
      }
    },
  }),
  {
    persist: {
      name: 'navRestoration',
      version: 0,
    },
  },
);

export const useNavRestorationStore = create(navRestorationStore);
