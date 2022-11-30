import create from 'zustand';

import { TxDefaultSpeedType } from '~/core/references/txDefaultSpeed';
import { createStore } from '~/core/state/internal/createStore';

export interface CurrentTxDefaultSpeedState {
  currentTxDefaultSpeed: TxDefaultSpeedType;
  setCurrentTxDefaultSpeed: (txDefaultSpeed: TxDefaultSpeedType) => void;
}

export const currentTxDefaultSpeedStore =
  createStore<CurrentTxDefaultSpeedState>(
    (set) => ({
      currentTxDefaultSpeed: 'urgent',
      setCurrentTxDefaultSpeed: (newTxDefaultSpeed) =>
        set({ currentTxDefaultSpeed: newTxDefaultSpeed }),
    }),
    {
      persist: {
        name: 'currentTxDefaultSpeed',
        version: 0,
      },
    },
  );

export const useCurrentTxDefaultSpeedStore = create(currentTxDefaultSpeedStore);
