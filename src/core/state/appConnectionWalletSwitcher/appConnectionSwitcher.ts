import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface AppConnectionWalletSwitcherStore {
  nudgeSheetEnabled: boolean;
  nudgeSheetInteractionsByAddressByApp: Record<
    string,
    Record<Address, boolean>
  >;
  nudgeSheetInteractionsByApp: Record<string, boolean>;
  addressInAppHasInteractedWithNudgeSheet: ({
    address,
    host,
  }: {
    address: Address;
    host: string;
  }) => boolean;
  appHasInteractedWithNudgeSheet: ({ host }: { host: string }) => boolean;
  setNudgeSheetDisabled: () => void;
  setAddressInAppHasInteractedWithNudgeSheet: ({
    address,
    host,
    interacted,
  }: {
    address: Address;
    host: string;
    interacted?: boolean;
  }) => void;
  setAppHasInteractedWithNudgeSheet: ({
    host,
    interacted,
  }: {
    host: string;
    interacted?: boolean;
  }) => void;
  clearAppHasInteractedWithNudgeSheet: ({ host }: { host: string }) => void;
  disableNudgeSheet: () => void;
}

export const appConnectionWalletSwitcherStore =
  createStore<AppConnectionWalletSwitcherStore>(
    (set, get) => ({
      nudgeSheetEnabled: true,
      nudgeSheetInteractionsByAddressByApp: {},
      nudgeSheetInteractionsByApp: {},
      addressInAppHasInteractedWithNudgeSheet: ({ address, host }) => {
        const nudgeSheetInteractionsByAddressByApp =
          get().nudgeSheetInteractionsByAddressByApp;
        return !!nudgeSheetInteractionsByAddressByApp?.[host]?.[address];
      },
      appHasInteractedWithNudgeSheet: ({ host }) => {
        const nudgeSheetInteractionsByApp = get().nudgeSheetInteractionsByApp;
        return !!nudgeSheetInteractionsByApp[host];
      },
      setNudgeSheetDisabled: () => {
        set({
          nudgeSheetEnabled: false,
        });
      },
      setAddressInAppHasInteractedWithNudgeSheet: ({
        address,
        host,
        interacted = true,
      }) => {
        const nudgeSheetInteractionsByAddressByApp =
          get().nudgeSheetInteractionsByAddressByApp;
        set({
          nudgeSheetInteractionsByAddressByApp: {
            ...nudgeSheetInteractionsByAddressByApp,
            [host]: {
              [address]: interacted,
            },
          },
        });
      },
      setAppHasInteractedWithNudgeSheet: ({ host, interacted = true }) => {
        const newNudgeSheetInteractionsByApp =
          get().nudgeSheetInteractionsByApp;
        set({
          nudgeSheetInteractionsByApp: {
            ...newNudgeSheetInteractionsByApp,
            [host]: interacted,
          },
        });
      },
      clearAppHasInteractedWithNudgeSheet: ({ host }) => {
        const {
          nudgeSheetInteractionsByAddressByApp,
          nudgeSheetInteractionsByApp,
        } = get();
        delete nudgeSheetInteractionsByAddressByApp[host];
        delete nudgeSheetInteractionsByApp[host];
        set({
          nudgeSheetInteractionsByAddressByApp: {
            ...nudgeSheetInteractionsByAddressByApp,
          },
          nudgeSheetInteractionsByApp: {
            ...nudgeSheetInteractionsByApp,
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
