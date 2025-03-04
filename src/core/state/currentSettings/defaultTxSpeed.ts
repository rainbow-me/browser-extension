import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { GasSpeed } from '~/core/types/gas';
import { DefaultTxSpeedOption } from '~/core/types/settings';

export interface DefaultTxSpeedState {
  defaultTxSpeed: DefaultTxSpeedOption;
  setDefaultTxSpeed: (defaultTxSpeed: DefaultTxSpeedOption) => void;
}

export const defaultTxSpeedStore = createStore<DefaultTxSpeedState>(
  (set) => ({
    defaultTxSpeed: GasSpeed.NORMAL,
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
