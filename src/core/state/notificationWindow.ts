import create from 'zustand';

import { createStore } from './internal/createStore';

export type NotificationWindow = chrome.windows.Window;

export interface NotificationWindowsState {
  window: NotificationWindow | null;
  setWindow: (window: NotificationWindow) => void;
}

export const notificationWindowStore = createStore<NotificationWindowsState>(
  (set) => ({
    window: null,
    setWindow: (newWindow) => set({ window: newWindow }),
  }),
  {
    persist: {
      name: 'notificationWindowStore',
      version: 0,
    },
  },
);

export const useNotificationWindowStore = create(notificationWindowStore);
