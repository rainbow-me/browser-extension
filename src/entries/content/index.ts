/**
 * Content script - bridges inpage ↔ background
 *
 * Sets up a relay that forwards portal messages between
 * window.postMessage (inpage) and chrome.runtime (background).
 */

import { createRelayTransport } from 'viem-portal';

// eslint-disable-next-line boundaries/element-types
import { useIsDefaultWalletStore } from '~/core/state';
require('../../core/utils/lockdown');

// Firefox needs script tag injection
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

// Set up the portal relay (window ↔ chrome.runtime)
createRelayTransport();

// Send default wallet preference to inpage
setTimeout(() => {
  const isDefault = useIsDefaultWalletStore.getState().isDefaultWallet;
  window.postMessage(
    {
      type: 'rainbow_setDefaultProvider',
      data: { rainbowAsDefault: isDefault },
    },
    '*',
  );
}, 1);
