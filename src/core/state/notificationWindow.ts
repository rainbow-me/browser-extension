import create from 'zustand';
import { createStore } from './internal/createStore';

export type NotificationWindow = chrome.windows.Window;

export interface NotificationWindowsState {
  currentWindow: NotificationWindow | null;
  setCurrentWindow: (window: NotificationWindow) => void;
}

export const notificationWindowStore = createStore<NotificationWindowsState>(
  (set) => ({
    currentWindow: null,
    setCurrentWindow: (newWindow) => set({ currentWindow: newWindow }),
  }),
  {
    persist: {
      name: 'notificationWindowStore',
      version: 0,
    },
  },
);

export const useNotificationWindowStore = create(notificationWindowStore);
