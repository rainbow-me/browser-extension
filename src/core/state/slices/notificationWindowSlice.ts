import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export type NotificationWindow = chrome.windows.Window;

export interface NotificationWindowsSliceState {
  currentWindow: NotificationWindow | null;
  setCurrentWindow: (request: NotificationWindow) => void;
}

export const notificationWindowSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  NotificationWindowsSliceState
> = (set) => ({
  currentWindow: null,
  setCurrentWindow: (currentWindow) => set({ currentWindow }),
});
