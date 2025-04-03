import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

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

export const walletAvatarStore = createStore<WalletAvatarStore>(
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
    persist: {
      name: 'walletAvatarStore',
      version: 0,
    },
  },
);

export const useWalletAvatarStore = create(() => walletAvatarStore.getState());
