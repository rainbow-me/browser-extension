import { initializeMessenger } from '~/core/messengers';
import { setupBridgeMessengerRelay } from '~/core/messengers/internal/bridge';
// eslint-disable-next-line boundaries/element-types
import { useIsDefaultWalletStore } from '~/core/state';
require('../../core/utils/lockdown');

// TODO: Remove state usage within the content script; this is vulnerable.

const insertInpageScriptIfNeeded = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isFirefox = userAgent.includes('firefox');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  
  // Firefox and Safari need manual script injection
  if (isFirefox || isSafari) {
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
