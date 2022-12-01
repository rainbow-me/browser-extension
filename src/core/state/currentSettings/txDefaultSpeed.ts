import create from 'zustand';

import { TxDefaultSpeedType } from '~/core/references/txDefaultSpeed';
import { createStore } from '~/core/state/internal/createStore';

export interface TxDefaultSpeedState {
  txDefaultSpeed: TxDefaultSpeedType;
  setTxDefaultSpeed: (txDefaultSpeed: TxDefaultSpeedType) => void;
}

export const txDefaultSpeedStore = createStore<TxDefaultSpeedState>(
  (set) => ({
    txDefaultSpeed: 'normal',
    setTxDefaultSpeed: (newTxDefaultSpeed) =>
      set({ txDefaultSpeed: newTxDefaultSpeed }),
  }),
  {
    persist: {
      name: 'txDefaultSpeed',
      version: 0,
    },
  },
);

export const useTxDefaultSpeedStore = create(txDefaultSpeedStore);
