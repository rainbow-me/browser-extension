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

export interface WalletBackupsStore {
  walletBackups: {
    [address: Address]: { backedUp: boolean; timestamp: Date | number };
  };
  setWalletAlreadyBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  setWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  isWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => boolean;
  deleteWalletBackup: ({ address }: { address: Address }) => void;
  getWalletBackup: ({
    wallet,
  }: {
    wallet: KeychainWallet;
  }) => { backedUp: boolean; timestamp: Date | number } | null;
  clear: () => void;
}

export const walletBackupsStore = createStore<WalletBackupsStore>(
  (set, get) => ({
    walletBackups: {},
    setWalletAlreadyBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackups } = get();
        const newWalletBackups = {
          ...walletBackups,
          [wallet.accounts[0]]: { backedUp: true, timestamp: 0 },
        };
        set({
          walletBackups: { ...newWalletBackups },
        });
      }
    },
    setWalletBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain) {
        const { walletBackups } = get();
        const newWalletBackups = {
          ...walletBackups,
          [wallet.accounts[0]]: { backedUp: true, timestamp: Date.now() },
        };
        set({
          walletBackups: { ...newWalletBackups },
        });
      }
    },
    isWalletBackedUp: ({ wallet }) => {
      if (wallet.type === KeychainType.HdKeychain && !wallet.imported) {
        const { walletBackups } = get();
        return !!walletBackups[wallet.accounts[0]]?.backedUp;
      } else {
        return true;
      }
    },
    deleteWalletBackup: ({ address }) => {
      const { walletBackups: newWalletBackups } = get();
      delete newWalletBackups[address];
      set({ walletBackups: { ...newWalletBackups } });
    },
    getWalletBackup: ({ wallet }) => {
      if (wallet.type !== KeychainType.HdKeychain || wallet.imported) {
        return { backedUp: true, timestamp: 0 };
      } else {
        const { walletBackups } = get();
        return walletBackups[wallet.accounts[0]] || null;
      }
    },

    clear: () => {
      set({ walletBackups: {} });
    },
  }),
  {
    persist: {
      name: 'walletBackups',
      version: 0,
    },
  },
);

export const useWalletBackupsStore = create(walletBackupsStore);
