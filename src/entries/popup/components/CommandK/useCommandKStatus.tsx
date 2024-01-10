import create from 'zustand';

import { EventProperties, event } from '~/analytics/event';
import { promoTypes, quickPromoStore } from '~/core/state/quickPromo';

const analyticsTrack = <T extends keyof EventProperties>(
  event: T,
  params?: EventProperties[T],
) =>
  import('~/analytics').then(({ analytics }) => analytics.track(event, params));

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
      analyticsTrack(event.commandKOpened);
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
    set({ isCommandKVisible: false, isExiting: true });
    const { refocus } = options;
    analyticsTrack(event.commandKClosed);
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
