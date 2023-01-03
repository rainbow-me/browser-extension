/**
 * Handles the extension installation event.
 */
export const handleInstallExtension = () =>
  chrome.runtime.onInstalled.addListener(async () => {
    if (process.env.NODE_ENV === 'development') {
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
    } // else {
    //   chrome.tabs.create({
    //     url: `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`,
    //   });
    // }
  });
