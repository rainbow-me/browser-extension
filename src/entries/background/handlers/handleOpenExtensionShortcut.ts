import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { RainbowError, logger } from '~/logger';

/**
 * Handles keyboard commands for the extension
 */
export const handleOpenExtensionShortcut = () => {
  const openPopup = () => {
    try {
      chrome.action.openPopup();
    } catch (error) {
      logger.error(new RainbowError('Error opening extension popup'), {
        error,
      });
    }
  };

  chrome.commands?.onCommand.addListener((command) => {
    if (command === 'open_rainbow') {
      openPopup();

      queueEventTracking(event.browserCommandTriggered, {
        command: 'launched',
      });
    }
  });
};
