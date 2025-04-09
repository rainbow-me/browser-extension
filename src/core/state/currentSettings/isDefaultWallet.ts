import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface IsDefaultWalletState {
  isDefaultWallet: boolean;
  setIsDefaultWallet: (isDefaultWallet: boolean) => void;
}

export const useIsDefaultWalletStore = createRainbowStore<IsDefaultWalletState>(
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
