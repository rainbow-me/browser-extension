import create from 'zustand';

import { createStore } from './internal/createStore';

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

export const notificationWindowStore = createStore<NotificationWindowsState>(
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
    persist: {
      name: 'notificationWindowStore',
      version: 0,
    },
  },
);

export const useNotificationWindowStore = create(notificationWindowStore);
