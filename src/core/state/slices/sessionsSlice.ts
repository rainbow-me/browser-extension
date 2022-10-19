import { StateCreator } from 'zustand';

interface Sessions {
  [host: string]: {
    accountAdddress: string;
    chainId: string;
  };
}

export interface SessionsSliceState {
  sessions: Sessions;
  currentAccount: string;
  setSessions: (sessions: Sessions) => void;
  getSession: (host: string) => void;
  createSession: (
    host: string,
    accountAdddress: string,
    chainId: string,
  ) => void;
  updateSession: (
    host: string,
    accountAdddress: string,
    chainId: string,
  ) => void;
}

export const sessionsSlice: StateCreator<
  SessionsSliceState,
  [['zustand/persist', unknown]],
  [],
  SessionsSliceState
> = (set, get) => ({
  sessions: {},
  currentAccount: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  setSessions: (sessions: Sessions) => set({ sessions }),
  getSession: (host: string) => {
    const sessions = get().sessions;
    return sessions[host];
  },
  createSession: (host: string, accountAdddress: string, chainId: string) => {
    const sessions = get().sessions;
    const newSessions = {
      [host]: {
        accountAdddress,
        chainId,
      },
      ...sessions,
    };
    set({ sessions: newSessions });
  },
  updateSession: (host: string, accountAdddress: string, chainId: string) => {
    const sessions = get().sessions;
    const newSessions = {
      ...sessions,
      [host]: { accountAdddress, chainId },
    };
    set({ sessions: newSessions });
  },
});
