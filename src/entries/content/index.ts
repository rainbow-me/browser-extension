import { initializeMessenger } from '~/core/messengers';
import { setupBridgeMessengerRelay } from '~/core/messengers/internal/bridge';
// eslint-disable-next-line boundaries/element-types
import { settingsStorage } from '~/core/state/currentSettings/store';
require('../../core/utils/lockdown');

// TODO: Remove state usage within the content script; this is vulnerable.

const insertInpageScriptIfNeeded = () => {
  if (navigator.userAgent.toLowerCase().includes('firefox')) {
    const targetElement = document.head || document.documentElement;
    const tag = document.createElement('script');
    tag.setAttribute('async', 'false');
    tag.setAttribute('src', chrome.runtime.getURL('inpage.js'));
    targetElement.insertBefore(tag, targetElement.children[0]);
    targetElement.removeChild(tag);
  }
};

insertInpageScriptIfNeeded();

setupBridgeMessengerRelay();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

setTimeout(async () => {
  const rainbowAsDefault = await settingsStorage.getItem(
    'settings:isDefaultWallet',
  );
  inpageMessenger.send('rainbow_setDefaultProvider', {
    rainbowAsDefault: rainbowAsDefault,
  });
}, 1);
