import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface NetworkSwitcherIsOpenState {
  setNetworkSwitcherIsOpen: (isOpen: boolean) => void;
  networkSwitcherIsOpen: boolean;
}

export const networkSwitcherIsOpenStore =
  createStore<NetworkSwitcherIsOpenState>((set) => ({
    setNetworkSwitcherIsOpen: (networkSwitcherIsOpen?: boolean) => {
      set({ networkSwitcherIsOpen });
    },
    networkSwitcherIsOpen: false,
  }));

export const useNetworkSwitcherIsOpenStore = create(networkSwitcherIsOpenStore);
