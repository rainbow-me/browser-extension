import { Address } from 'wagmi';
import create from 'zustand';

import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { createStore } from '../internal/createStore';

export interface WalletBackUpsStore {
  walletBackUps: { [address: Address]: { backedUp: boolean; timestamp: Date } };
  setWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  isWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => boolean;
  getWalletBackUp: ({
    wallet,
  }: {
    wallet: KeychainWallet;
  }) => { backedUp: boolean; timestamp: Date } | null;
  clear: () => void;
}

export const walletBackUpsStore = createStore<WalletBackUpsStore>(
  (set, get) => ({
    walletBackUps: {},
    setWalletBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackUps } = get();
        const newWalletBackUps = {
          ...walletBackUps,
          [wallet.accounts[0]]: { backedUp: true, timestamp: Date.now() },
        };
        set({
          walletBackUps: { ...newWalletBackUps },
        });
      }
    },
    isWalletBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackUps } = get();
        return !!walletBackUps[wallet.accounts[0]]?.backedUp;
      } else {
        return true;
      }
    },
    getWalletBackUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackUps } = get();
        return walletBackUps[wallet.accounts[0]] || null;
      } else {
        return null;
      }
    },
    clear: () => {
      set({ walletBackUps: {} });
    },
  }),
  {
    persist: {
      name: 'walletBackUps',
      version: 0,
    },
  },
);

export const useWalletBackUpsStore = create(walletBackUpsStore);
