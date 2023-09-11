import { Address } from 'wagmi';
import create from 'zustand';

import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { createStore } from '../internal/createStore';

export interface ShowWalletBackupReminderStore {
  show: boolean;
  setShowWalletBackupReminder: (show: boolean) => void;
}

export const showWalletBackupReminderStore =
  createStore<ShowWalletBackupReminderStore>((set) => ({
    show: false,
    setShowWalletBackupReminder: (show) => {
      set({ show });
    },
  }));

export const useShowWalletBackupReminderStore = create(
  showWalletBackupReminderStore,
);

export interface WalletBackupReminderStore {
  reminded: boolean;
  setReminded: () => void;
}

export const walletBackupReminderStore = createStore<WalletBackupReminderStore>(
  (set) => ({
    reminded: false,
    setReminded: () => {
      set({ reminded: true });
    },
  }),
);

export const useWalletBackupReminderStore = create(walletBackupReminderStore);

export interface WalletBackUpsStore {
  walletBackUps: {
    [address: Address]: { backedUp: boolean; timestamp: Date | number };
  };
  setWalletAlreadyBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  setWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  isWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => boolean;
  deleteWalletBackup: ({ address }: { address: Address }) => void;
  getWalletBackUp: ({
    wallet,
  }: {
    wallet: KeychainWallet;
  }) => { backedUp: boolean; timestamp: Date | number } | null;
  clear: () => void;
}

export const walletBackUpsStore = createStore<WalletBackUpsStore>(
  (set, get) => ({
    walletBackUps: {},
    setWalletAlreadyBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackUps } = get();
        const newWalletBackUps = {
          ...walletBackUps,
          [wallet.accounts[0]]: { backedUp: true, timestamp: 0 },
        };
        set({
          walletBackUps: { ...newWalletBackUps },
        });
      }
    },
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
      if (wallet.type === KeychainType.HdKeychain && !wallet.imported) {
        const { walletBackUps } = get();
        return !!walletBackUps[wallet.accounts[0]]?.backedUp;
      } else {
        return true;
      }
    },
    deleteWalletBackup: ({ address }) => {
      const { walletBackUps: newWalletBackUps } = get();
      delete newWalletBackUps[address];
      set({ walletBackUps: { ...newWalletBackUps } });
    },
    getWalletBackUp: ({ wallet }) => {
      if (wallet.type !== KeychainType.HdKeychain || wallet.imported) {
        return { backedUp: true, timestamp: 0 };
      } else {
        const { walletBackUps } = get();
        return walletBackUps[wallet.accounts[0]] || null;
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
