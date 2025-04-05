import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { withSelectors } from '../internal/withSelectors';

export interface WalletBackupReminderStore {
  reminded: boolean;
  setReminded: () => void;
}

export const walletBackupReminderStore =
  createRainbowStore<WalletBackupReminderStore>((set) => ({
    reminded: false,
    setReminded: () => {
      set({ reminded: true });
    },
  }));

export const useWalletBackupReminderStore = walletBackupReminderStore;

export interface WalletBackupsStore {
  needsInitialization: boolean;
  walletBackups: {
    [address: Address]: { backedUp: boolean; timestamp: Date | number };
  };
  setNeedsInitialization: (needsInitialization: boolean) => void;
  setWalletAlreadyBackedUp: ({ wallet }: { wallet: KeychainWallet }) => void;
  setWalletBackedUp: ({ address }: { address: Address }) => void;
  isWalletBackedUp: ({ wallet }: { wallet: KeychainWallet }) => boolean;
  deleteWalletBackup: ({ address }: { address: Address }) => void;
  getWalletBackup: ({
    wallet,
  }: {
    wallet: KeychainWallet;
  }) => { backedUp: boolean; timestamp: Date | number } | null;
  clear: () => void;
}

export const walletBackupsStore = createRainbowStore<WalletBackupsStore>(
  (set, get) => ({
    needsInitialization: true,
    walletBackups: {},
    setNeedsInitialization: (needsInitialization) =>
      set({ needsInitialization }),
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
    setWalletBackedUp: ({ address }) => {
      const { walletBackups } = get();
      const newWalletBackups = {
        ...walletBackups,
        [address]: { backedUp: true, timestamp: Date.now() },
      };
      set({
        walletBackups: { ...newWalletBackups },
      });
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
      set({ walletBackups: {}, needsInitialization: true });
    },
  }),
  {
    storageKey: 'walletBackups',
    version: 0,
  },
);

export const useWalletBackupsStore = withSelectors(walletBackupsStore);
