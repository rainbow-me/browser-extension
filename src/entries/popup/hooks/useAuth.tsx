import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as wallet from '../handlers/wallet';

const AuthContext = createContext({
  status: 'NEW',
  updateStatus: () => undefined,
});

export type UserStatusResult = 'LOCKED' | 'NEEDS_PASSWORD' | 'NEW' | 'READY';

const getUserStatus = async (): Promise<UserStatusResult> => {
  // here we'll run the redirect logic
  // if we have a vault set it means onboarding is complete
  const { unlocked, hasVault, passwordSet } = await wallet.getStatus();
  // if we don't have a password set we need to check if there's a wallet
  console.log({
    unlocked,
    hasVault,
    passwordSet,
  });
  if (hasVault) {
    // Check if it has a password set
    if (passwordSet) {
      if (unlocked) {
        return 'READY';
      } else {
        return 'LOCKED';
      }
    } else {
      return 'NEEDS_PASSWORD';
    }
  } else {
    return 'NEW';
  }
};

const useSessionStatus = () => {
  const [status, setStatus] = useState('');

  const updateStatus = useCallback(async () => {
    console.log('updating ssession status');
    const newStatus = await getUserStatus();
    console.log('new status is', newStatus);
    setStatus(newStatus);
    await chrome.storage.session.set({ userStatus: null });
    console.log('done updating');
  }, []);

  useEffect(() => {
    const init = async () => {
      // Read from local storage first
      console.log('reading status from session storage...');
      const { userStatus: statusFromStorage } =
        await chrome.storage.session.get('userStatus');
      if (!statusFromStorage) {
        console.log('nothing found in session storage, refreshing status');
        updateStatus();
      } else {
        console.log('got status from session storage...', statusFromStorage);
        setStatus(statusFromStorage);
      }
    };
    init();
  }, [updateStatus]);

  return {
    status,
    updateStatus,
    clearStatus: () => setStatus(''),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, updateStatus } = useSessionStatus();

  const value = useMemo(
    () => ({
      status,
      updateStatus,
    }),
    [status, updateStatus],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
