import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from './_internal';

export type NotificationWindow = chrome.windows.Window;

export interface NotificationWindows {
  [key: string]: NotificationWindow | undefined;
}

export interface NotificationWindowsState {
  notificationWindows: NotificationWindows;
  setNotificationWindow: (
    tabId: string,
    notificationWindow: NotificationWindow | undefined,
  ) => void;
}

export const useNotificationWindowStore =
  createBaseStore<NotificationWindowsState>(
    (set) => ({
      notificationWindows: {},
      setNotificationWindow: (tabId, newNotificationWindow) =>
        set((state) => ({
          notificationWindows: {
            ...state.notificationWindows,
            [tabId.toString()]: newNotificationWindow,
          },
        })),
    }),
    createExtensionStoreOptions({
      storageKey: 'notificationWindowStore',
      version: 0,
    }),
  );
