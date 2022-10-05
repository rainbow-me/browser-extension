export {};

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
  } else {
    // Page we want to show after installation
    const tab = await chrome.tabs.create({ url: 'https://rainbow.me/' });
    console.log(`Created tab ${tab.id}`);
  }
});

const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
const DEFAULT_CHAIN_ID = '0x1';

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  console.log('Received message', request);
  try {
    let response = null;
    switch (request.method) {
      case 'eth_chainId':
        response = DEFAULT_CHAIN_ID;
        break;
      case 'eth_requestAccounts':
        response = [DEFAULT_ACCOUNT];
        break;
    }
    console.log('responding message', response);

    sendResponse({ result: response });
  } catch (e) {
    sendResponse({ result: null, error: e });
  }
});
