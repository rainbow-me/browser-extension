import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { autoLockTimerOptions } from '~/core/references/autoLockTimer';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';

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
  const { autoLockTimer } = useAutoLockTimerStore();
  const autoLockTimerMinutes = autoLockTimerOptions[autoLockTimer].mins;

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

  useEffect(() => {
    // check if have to autolock
    const runAutoLock = async () => {
      if (autoLockTimerMinutes !== null) {
        const userStatus = await getUserStatus();
        // to not interfere with onboarding status, only autolock if status is READY
        if (userStatus === 'READY') {
          const { lastUnlock: lastUnlockFromStorage } =
            await chrome.storage.session.get('lastUnlock');
          if (lastUnlockFromStorage) {
            const lastUnlock = new Date(lastUnlockFromStorage);
            const now = new Date();
            const diff = now.getTime() - lastUnlock.getTime();
            const diffMinutes = Math.round(diff / 1000 / 60);
            if (diffMinutes >= autoLockTimerMinutes) {
              await wallet.lock();
              updateStatus();
            }
            // if no lastUnlock found in storage, re-lock for safety
          } else {
            await wallet.lock();
            updateStatus();
          }
        }
      }
    };
    runAutoLock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
