import create from 'zustand';

import { createStore } from './internal/createStore';

export type NotificationWindow = chrome.windows.Window;

export interface NotificationWindowsState {
  notificationWindow: NotificationWindow | null;
  setNotificationWindow: (
    notificationWindow: NotificationWindow | null,
  ) => void;
}

export const notificationWindowStore = createStore<NotificationWindowsState>(
  (set) => ({
    notificationWindow: null,
    setNotificationWindow: (newNotificationWindow) =>
      set({ notificationWindow: newNotificationWindow }),
  }),
  {
    persist: {
      name: 'notificationWindowStore',
      version: 0,
    },
  },
);

export const useNotificationWindowStore = create(notificationWindowStore);
