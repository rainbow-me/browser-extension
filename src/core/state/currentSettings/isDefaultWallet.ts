import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface IsDefaultWalletState {
  isDefaultWallet: boolean;
  setIsDefaultWallet: (isDefaultWallet: boolean) => void;
}

export const isDefaultWalletStore = createRainbowStore<IsDefaultWalletState>(
  (set) => ({
    isDefaultWallet: true,
    setIsDefaultWallet: (newIsDefaultWallet) =>
      set({ isDefaultWallet: newIsDefaultWallet }),
  }),
  {
    storageKey: 'isDefaultWallet',
    version: 0,
  },
);

export const useIsDefaultWalletStore = isDefaultWalletStore;
