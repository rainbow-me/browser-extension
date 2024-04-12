import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface ConnectedToHardhatState {
  connectedToHardhat: boolean;
  setConnectedToHardhat: (connectedToHardhat: boolean) => void;

  connectedToHardhatOp: boolean;
  setConnectedToHardhatOp: (connectedToHardhatOp: boolean) => void;

  connectedToHardhatPolygon: boolean;
  setConnectedToHardhatPolygon: (connectedToHardhatPolygon: boolean) => void;
}

export const connectedToHardhatStore = createStore<ConnectedToHardhatState>(
  (set) => ({
    connectedToHardhat: false,
    setConnectedToHardhat: (connectedToHardhat) => {
      set({ connectedToHardhat });
    },

    connectedToHardhatOp: false,
    setConnectedToHardhatOp: (connectedToHardhatOp) => {
      set({ connectedToHardhatOp });
    },
    connectedToHardhatPolygon: false,
    setConnectedToHardhatPolygon: (connectedToHardhatPolygon) => {
      set({ connectedToHardhatPolygon });
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
