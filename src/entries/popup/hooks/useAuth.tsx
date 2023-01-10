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
  updateStatus: () => Promise.resolve(),
});

export type UserStatusResult = 'LOCKED' | 'NEEDS_PASSWORD' | 'NEW' | 'READY';

const getUserStatus = async (): Promise<UserStatusResult> => {
  // here we'll run the redirect logic
  // if we have a vault set it means onboarding is complete
  const { unlocked, hasVault, passwordSet } = await wallet.getStatus();
  // if we don't have a password set we need to check if there's a wallet
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
    const newStatus = await getUserStatus();
    setStatus(newStatus);
    await chrome.storage.session.set({ userStatus: newStatus });
  }, []);

  useEffect(() => {
    const init = async () => {
      // Read from local storage first
      const { userStatus: statusFromStorage } =
        await chrome.storage.session.get('userStatus');
      if (!statusFromStorage) {
        updateStatus();
      } else {
        setStatus(statusFromStorage);
      }
    };
    init();
  }, [updateStatus]);

  return {
    status,
    setStatus,
    updateStatus,
    clearStatus: () => setStatus(''),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, updateStatus, setStatus } = useSessionStatus();

  useEffect(() => {
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (!changes['userStatus']) return;
      const newValue = changes['userStatus']?.newValue;
      const oldValue = changes['userStatus']?.oldValue;
      if (newValue === oldValue) return;
      setStatus(newValue);
    };
    chrome.storage.session?.onChanged?.addListener(listener);
    return () => chrome.storage.session?.onChanged?.removeListener(listener);
  }, [setStatus, status]);

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
