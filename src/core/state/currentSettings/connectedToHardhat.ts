import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface ConnectedToHardhatState {
  connectedToHardhat: boolean;
  setConnectedToHardhat: (connectedToHardhat: boolean) => void;
}

export const connectedToHardhatStore = createStore<ConnectedToHardhatState>(
  (set) => ({
    connectedToHardhat: false,
    setConnectedToHardhat: (connectedToHardhat) => {
      set({ connectedToHardhat });
    },
  }),
  {
    persist: {
      name: 'connectedToHardhat',
      version: 0,
    },
  },
);

export const useConnectedToHardhatStore = create(connectedToHardhatStore);
