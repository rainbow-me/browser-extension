import create from 'zustand';

type CommandKState = {
  isCommandKVisible: boolean;
  openCommandK: () => void;
  closeCommandK: (options?: { refocus: boolean }) => void;
  isExiting: boolean;
  setFinishedExiting: () => void;
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
      set({ isCommandKVisible: true });
    }
  };

  const closeCommandK = (options = { refocus: true }) => {
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

  const setLastActiveElement = (element: HTMLElement | null) => {
    set({ lastActiveElement: element });
  };

  return {
    isCommandKVisible: false,
    isExiting: false,
    lastActiveElement: null,
    openCommandK,
    closeCommandK,
    setFinishedExiting,
    setLastActiveElement,
  };
});
