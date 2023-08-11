import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface AppConnectionWalletSwitcherStore {
  nudgeSheetEnabled: boolean;
  nudgeSheetInteractionsByAddress: Record<Address, boolean>;
  nudgeSheetInteractionsByApp: Record<string, boolean>;
  addressHasInteractedWithNudgeSheet: ({
    address,
  }: {
    address: Address;
  }) => boolean;
  appHasInteractedWithNudgeSheet: ({ host }: { host: string }) => boolean;
  setAddressHasInteractedWithNudgeSheet: ({
    address,
  }: {
    address: Address;
  }) => void;
  setAppHasInteractedWithNudgeSheet: ({ host }: { host: string }) => void;
  disableNudgeSheet: () => void;
}

export const appConnectionWalletSwitcherStore =
  createStore<AppConnectionWalletSwitcherStore>(
    (set, get) => ({
      nudgeSheetEnabled: true,
      nudgeSheetInteractionsByAddress: {},
      nudgeSheetInteractionsByApp: {},
      addressHasInteractedWithNudgeSheet: ({ address }) => {
        const nudgeSheetInteractionsByAddress =
          get().nudgeSheetInteractionsByAddress;
        return !!nudgeSheetInteractionsByAddress[address];
      },
      appHasInteractedWithNudgeSheet: ({ host }) => {
        const nudgeSheetInteractionsByApp = get().nudgeSheetInteractionsByApp;
        return !!nudgeSheetInteractionsByApp[host];
      },
      setAddressHasInteractedWithNudgeSheet: ({ address }) => {
        const newNudgeSheetInteractionsByAddress =
          get().nudgeSheetInteractionsByAddress;
        set({
          nudgeSheetInteractionsByAddress: {
            ...newNudgeSheetInteractionsByAddress,
            [address]: true,
          },
        });
      },
      setAppHasInteractedWithNudgeSheet: ({ host }) => {
        const newNudgeSheetInteractionsByApp =
          get().nudgeSheetInteractionsByApp;
        set({
          nudgeSheetInteractionsByApp: {
            ...newNudgeSheetInteractionsByApp,
            [host]: true,
          },
        });
      },
      disableNudgeSheet: () => {
        set({
          nudgeSheetEnabled: false,
        });
      },
    }),
    {
      persist: {
        name: 'appConnectionWalletSwitcherStore',
        version: 0,
      },
    },
  );

export const useAppConnectionWalletSwitcherStore = create(
  appConnectionWalletSwitcherStore,
);
