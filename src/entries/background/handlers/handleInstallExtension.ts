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
      chrome.tabs.create({
        url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
      });
    }
  });
