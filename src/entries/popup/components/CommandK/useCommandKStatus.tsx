import create from 'zustand';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { promoTypes, quickPromoStore } from '~/core/state/quickPromo';

type CommandKState = {
  isCommandKVisible: boolean;
  openCommandK: () => void;
  closeCommandK: (options?: { refocus: boolean }) => void;
  isExiting: boolean;
  setFinishedExiting: () => void;
  isFetching: boolean;
  setIsFetching: (fetching?: boolean) => void;
  lastActiveElement: HTMLElement | null;
  setLastActiveElement: (element: HTMLElement | null) => void;
};

export const useCommandKStatus = create<CommandKState>((set, get) => {
  let pendingOperation: (() => void) | null = null;

  const executePendingOperation = () => {
    if (pendingOperation) {
      const op = pendingOperation;
      pendingOperation = null;
      op();
    }
  };

  const openCommandK = () => {
    if (get().isExiting) {
      pendingOperation = openCommandK;
    } else {
      analytics.track(event.commandKOpened);
      set(() => {
        const store = quickPromoStore.getState();
        if (!store.seenPromos[promoTypes.command_k]) {
          store.setSeenPromo(promoTypes.command_k);
        }
        return { isCommandKVisible: true };
      });
    }
  };

  const closeCommandK = (options = { refocus: true }) => {
    analytics.track(event.commandKClosed);
    set({ isCommandKVisible: false, isExiting: true });
    const { refocus } = options;
    if (refocus && get().lastActiveElement) {
      const refocusFunction = () => {
        get().lastActiveElement?.focus();
        set({ lastActiveElement: null });
      };
      setTimeout(refocusFunction, 0);
    }
  };

  const setFinishedExiting = () => {
    set({ isExiting: false });
    executePendingOperation();
  };

  const setIsFetching = (fetching?: boolean) => {
    set({ isFetching: fetching ?? true });
  };

  const setLastActiveElement = (element: HTMLElement | null) => {
    set({ lastActiveElement: element });
  };

  return {
    isCommandKVisible: false,
    openCommandK,
    closeCommandK,
    isExiting: false,
    setFinishedExiting,
    isFetching: false,
    setIsFetching,
    lastActiveElement: null,
    setLastActiveElement,
  };
});
