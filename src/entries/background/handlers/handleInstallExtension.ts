/* eslint-disable no-await-in-loop */
import { hasVault, isInitialized, isPasswordSet } from '~/core/keychain';

/**
 * Handles the extension installation event.
 */
export const handleInstallExtension = () =>
  chrome.runtime.onInstalled.addListener(async () => {
    if (process.env.IS_DEV === 'true') {
      chrome.contextMenus.create({
        id: 'open-tab',
        title: 'Open Extension in a New Tab',
        type: 'normal',
        contexts: ['action'],
      });

      chrome.contextMenus.onClicked.addListener((info) => {
        switch (info.menuItemId) {
          case 'open-tab':
            chrome.tabs.create({
              url: `chrome-extension://${chrome.runtime.id}/popup.html`,
            });
        }
      });
      // This breaks e2e!!
    } else if (process.env.IS_TESTING !== 'true') {
      // wait till the keychain is initialized
      let ready = await isInitialized();
      while (!ready) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 100));
        ready = await isInitialized();
      }
      // Check if we have a vault and if the password is set
      const _hasVault = await hasVault();
      const passwordSet = _hasVault && (await isPasswordSet());
      // if both are true, the user has been onboarded already
      const onboarded = _hasVault && passwordSet;
      // Only show the welcome screen if the user hasn't been onboarded yet
      if (!onboarded) {
        chrome.tabs.create({
          url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
        });
      }
    }
  });
