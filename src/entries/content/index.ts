import { initializeMessenger } from '~/core/messengers';
import { setupBridgeMessengerRelay } from '~/core/messengers/internal/bridge';
import { useIsDefaultWalletStore } from '~/core/state';
require('../../core/utils/lockdown');

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

setTimeout(() => {
  inpageMessenger.send('rainbow_setDefaultProvider', {
    rainbowAsDefault: useIsDefaultWalletStore.getState().isDefaultWallet,
  });
}, 1);
