import create from 'zustand';

import { DefaultTxSpeedType } from '~/core/references/defaultTxSpeed';
import { createStore } from '~/core/state/internal/createStore';

export interface DefaultTxSpeedState {
  defaultTxSpeed: DefaultTxSpeedType;
  setDefaultTxSpeed: (defaultTxSpeed: DefaultTxSpeedType) => void;
}

export const defaultTxSpeedStore = createStore<DefaultTxSpeedState>(
  (set) => ({
    defaultTxSpeed: 'normal',
    setDefaultTxSpeed: (newDefaultTxSpeed) =>
      set({ defaultTxSpeed: newDefaultTxSpeed }),
  }),
  {
    persist: {
      name: 'defaultTxSpeed',
      version: 0,
    },
  },
);

export const useDefaultTxSpeedStore = create(defaultTxSpeedStore);
