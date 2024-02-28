import create from 'zustand';

import { createStore } from '../internal/createStore';

type GridPlusClientStore = {
  client: string;
  setClient: (client: string) => void;
};

export const gridPlusClientStore = createStore<GridPlusClientStore>(
  (set) => ({
    client: '',
    setClient: (client) => set({ client }),
  }),
  {
    persist: {
      name: 'gridplusClient',
      version: 0,
    },
  },
);

export const useGridPlusClientStore = create(gridPlusClientStore);
