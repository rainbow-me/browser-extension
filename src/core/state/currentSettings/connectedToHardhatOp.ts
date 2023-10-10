import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface ConnectedToHardhatOpState {
  connectedToHardhatOp: boolean;
  setConnectedToHardhatOp: (connectedToHardhatOp: boolean) => void;
}

export const connectedToHardhatOpStore = createStore<ConnectedToHardhatOpState>(
  (set) => ({
    connectedToHardhatOp: false,
    setConnectedToHardhatOp: (connectedToHardhatOp) => {
      set({ connectedToHardhatOp });
    },
  }),
  {
    persist: {
      name: 'connectedToHardhatOp',
      version: 0,
    },
  },
);

export const useConnectedToHardhatOpStore = create(connectedToHardhatOpStore);
