import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { RainbowError, logger } from '~/logger';

/**
 * Handles keyboard commands for the extension
 */
export const handleOpenExtensionShortcut = () => {
  // firefox maps chrome > browser, but it does still use
  // `browserAction` for manifest v2 & v3. in v3 chrome uses `action`
  const openPopup = () => {
    try {
      (chrome.action || chrome.browserAction).openPopup();
    } catch (error) {
      logger.error(new RainbowError('Error opening extension popup'), {
        error,
      });
    }
  };

  chrome.commands.onCommand.addListener((command) => {
    if (command === 'open_rainbow') {
      openPopup();

      queueEventTracking(event.browserCommandTriggered, {
        command: 'launched',
      });
    }
  });
};
