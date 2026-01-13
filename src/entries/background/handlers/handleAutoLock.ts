import { lockVault } from '~/core/keychain';
import { autoLockTimerOptions } from '~/core/references/autoLockTimer';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';
import { useLastActivityStore } from '~/core/state/lastActivity';
import { SessionStorage } from '~/core/storage';
import { getUserStatus } from '~/core/utils/userStatus';
import { RainbowError, logger } from '~/logger';

const CHECK_INTERVAL_MS = 30000; // 30 seconds

let checkInterval: NodeJS.Timeout | null = null;

/**
 * Checks if the wallet should be locked based on the autolock timer setting
 */
const checkAndLockIfNeeded = async () => {
  try {
    const userStatus = await getUserStatus();
    // Only autolock if wallet is READY (unlocked)
    if (userStatus !== 'READY') {
      return;
    }

    const { autoLockTimer } = useAutoLockTimerStore.getState();
    const autoLockTimerMinutes = autoLockTimerOptions[autoLockTimer].mins;

    // If autolock is disabled, nothing to do
    if (autoLockTimerMinutes === null) {
      return;
    }

    // For immediate lock, we handle it separately on popup close
    if (autoLockTimerMinutes === 0) {
      return;
    }

    const { lastActivity } = useLastActivityStore.getState();
    if (!lastActivity) {
      return;
    }

    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diff = now.getTime() - lastActivityDate.getTime();
    const diffMinutes = diff / 1000 / 60;

    if (diffMinutes >= autoLockTimerMinutes) {
      await lockVault();
    }
  } catch (error) {
    logger.error(new RainbowError('Error checking autolock', { cause: error }));
  }
};

/**
 * Starts periodic autolock checks (only when wallet is unlocked)
 */
const startPeriodicChecks = () => {
  // Clear any existing interval
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  // Start periodic checks
  checkInterval = setInterval(async () => {
    await checkAndLockIfNeeded();
  }, CHECK_INTERVAL_MS);
};

/**
 * Stops periodic autolock checks
 */
const stopPeriodicChecks = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

/**
 * Handles unlock status changes - starts/stops autolock checks accordingly
 */
const handleUnlockStatusChange = async () => {
  const userStatus = await getUserStatus();
  const { lastActivity } = useLastActivityStore.getState();
  const { autoLockTimer } = useAutoLockTimerStore.getState();
  const autoLockTimerMinutes = autoLockTimerOptions[autoLockTimer].mins;

  // Don't start periodic checks if immediate lock is enabled
  // Immediate lock is handled separately on popup disconnect
  if (
    userStatus === 'READY' &&
    lastActivity &&
    autoLockTimerMinutes !== null &&
    autoLockTimerMinutes !== 0
  ) {
    // Wallet is unlocked, we have activity data, and autolock is not immediate - start checks
    startPeriodicChecks();
    await checkAndLockIfNeeded();
  } else {
    // Wallet is locked, no activity, or immediate lock enabled - stop checks
    stopPeriodicChecks();
  }
};

/**
 * Initializes autolock functionality in the background service worker
 * Note: Immediate lock on popup close is handled in popupPortManager.ts
 */
export const handleAutoLock = () => {
  // Listen for encryptionKey changes (indicates unlock/lock status)
  // encryptionKey is set when wallet is unlocked, cleared when locked
  SessionStorage.listen('encryptionKey', async () => {
    await handleUnlockStatusChange();
  });

  // Check initial state
  void handleUnlockStatusChange();
};
