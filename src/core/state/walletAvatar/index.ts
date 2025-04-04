import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

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

export const walletAvatarStore = createRainbowStore<WalletAvatarStore>(
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
  {
    storageKey: 'walletAvatarStore',
    version: 0,
  },
);

export const useWalletAvatarStore = walletAvatarStore;
