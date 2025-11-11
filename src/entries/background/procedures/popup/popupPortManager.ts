import { lockVault } from '~/core/keychain';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';
import { SessionStorage } from '~/core/storage';
import { getUserStatus } from '~/core/utils/userStatus';
import { RainbowError, logger } from '~/logger';

const POPUP_INSTANCE_DATA_EXPIRY = 180000; // 3 minutes

// Track active popup ports
const activePopupPorts = new Set<chrome.runtime.Port>();

/**
 * Handles popup port disconnect - sets expiry and checks for immediate lock
 */
const handlePopupDisconnect = async (port: chrome.runtime.Port) => {
  // Remove from active ports
  activePopupPorts.delete(port);

  // Set expiry timestamp for popup instance data cleanup
  await SessionStorage.set('expiry', Date.now() + POPUP_INSTANCE_DATA_EXPIRY);

  // Check if all popup instances are closed
  if (activePopupPorts.size === 0) {
    // All popups closed - check if immediate lock is enabled
    const { autoLockTimer } = useAutoLockTimerStore.getState();

    if (autoLockTimer === 'immediately') {
      // Immediate lock enabled - lock the vault
      try {
        const userStatus = await getUserStatus();
        if (userStatus === 'READY') {
          await lockVault();
        }
      } catch (error) {
        logger.error(
          new RainbowError('Error handling immediate lock on popup close', {
            cause: error,
          }),
        );
      }
    }
  }
};

/**
 * Registers a popup port and sets up disconnect handling
 * Note: This should only be called once per port instance
 */
export const registerPopupPort = (port: chrome.runtime.Port) => {
  // Avoid duplicate registration if port is already tracked
  if (activePopupPorts.has(port)) {
    return;
  }

  activePopupPorts.add(port);

  port.onDisconnect.addListener(() => {
    void handlePopupDisconnect(port);
  });
};

/**
 * Gets the count of active popup ports
 */
export const getActivePopupPortCount = () => activePopupPorts.size;
