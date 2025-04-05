import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

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

export const notificationWindowStore =
  createRainbowStore<NotificationWindowsState>(
    (set, get) => ({
      notificationWindows: {},
      setNotificationWindow: (tabId, newNotificationWindow) => {
        const notificationWindows = get().notificationWindows;
        set({
          notificationWindows: {
            ...notificationWindows,
            [tabId.toString()]: newNotificationWindow,
          },
        });
      },
    }),
    {
      storageKey: 'notificationWindowStore',
      version: 0,
    },
  );

export const useNotificationWindowStore = notificationWindowStore;
