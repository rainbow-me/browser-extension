import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface WalletAvatar {
  color?: string;
  imageUrl?: string;
  emoji?: string;
}

type WalletAvatarStore = {
  walletAvatar: Record<string, WalletAvatar>;
  setWalletAvatar: ({
    addressOrName,
    walletAvatar,
  }: {
    addressOrName: string;
    walletAvatar: WalletAvatar;
  }) => void;
};

export const useWalletAvatarStore = createBaseStore<WalletAvatarStore>(
  (set, get) => ({
    walletAvatar: {},
    setWalletAvatar: ({ addressOrName, walletAvatar }) => {
      const { walletAvatar: oldWalletAvatar } = get();
      set({
        walletAvatar: {
          ...oldWalletAvatar,
          [addressOrName]: walletAvatar,
        },
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'walletAvatarStore',
    version: 0,
  }),
);
