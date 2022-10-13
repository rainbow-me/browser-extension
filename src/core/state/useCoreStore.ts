import create from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';

export interface CoreState {
  currentAddress?: string;
}

export interface CoreAction {
  setCurrentAddress: (address: string) => void;
}

export const useCoreStore = create<CoreState & CoreAction>()(
  persist(
    (set) => ({
      currentAddress: undefined,
      setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
    }),
    { name: 'store:core', getStorage: () => persistStorage },
  ),
);
