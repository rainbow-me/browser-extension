import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

export interface AppConnectionWalletSwitcherStore {
  nudgeSheetEnabled: boolean;
  nudgeSheetInteractionsByAddressByApp: Record<
    string,
    Record<Address, boolean>
  >;
  nudgeSheetInteractionsByApp: Record<string, boolean>;
  appHasInteractedWithNudgeSheet: ({ host }: { host?: string }) => boolean;
  setNudgeSheetDisabled: () => void;
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

export const useAppConnectionWalletSwitcherStore =
  createBaseStore<AppConnectionWalletSwitcherStore>(
    (set, get) => ({
      nudgeSheetEnabled: true,
      nudgeSheetInteractionsByAddressByApp: {},
      nudgeSheetInteractionsByApp: {},
      appHasInteractedWithNudgeSheet: ({ host }) => {
        const nudgeSheetInteractionsByApp = get().nudgeSheetInteractionsByApp;
        return !!host && !!nudgeSheetInteractionsByApp[host];
      },
      setNudgeSheetDisabled: () => {
        set({
          nudgeSheetEnabled: false,
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
    createExtensionStoreOptions({
      storageKey: 'appConnectionWalletSwitcherStore',
      version: 1,
    }),
  );
