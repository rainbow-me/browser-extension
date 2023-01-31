import { initializeMessenger } from '~/core/messengers';
import { RainbowProvider } from '~/core/providers';

import { injectNotificationIframe } from '../iframe';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
  }
}

const messenger = initializeMessenger({ connect: 'popup' });
const provider = new RainbowProvider({ messenger });

if (shouldInjectProvider()) {
  window.ethereum = provider;

  console.log('injection complete in window');
  window.dispatchEvent(new Event('ethereum#initialized'));

  window.onload = () => {
    const injectElement = document.createElement('div');
    injectElement.className = 'element';
    injectElement.innerHTML = 'hellowww';
    injectElement.id = 'hello';

    // injectElement.sandbox = 'allow-same-origin';
    // injectElement.style.width = '161px';
    // injectElement.style.height = '40px';
    // injectElement.style.borderRadius = '26px';
    // injectElement.style.borderWidth = '0px';
    // injectElement.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
    // injectElement.style.boxShadow =
    //   '0px 8px 24px rgba(37, 41, 46, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.02);';

    // injectElement.style.top = '88px';
    // injectElement.style.zIndex = '9999999';
    // injectElement.style.right = '100px';
    // injectElement.style.position = 'absolute';

    document.body.appendChild(injectElement);
    console.log('injection complete in window 2');

    const iframe = document.createElement('iframe');
    iframe.id = 'bx-notification-iframe';
    // iframe.sandbox = 'allow-same-origin';
    // iframe.style.width = '161px';
    // iframe.style.height = '40px';
    // iframe.style.borderRadius = '26px';
    // iframe.style.borderWidth = '0px';
    // iframe.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
    // iframe.style.boxShadow =
    //   '0px 8px 24px rgba(37, 41, 46, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.02);';

    // iframe.style.top = '88px';
    // iframe.style.zIndex = '9999999';
    // iframe.style.right = '100px';
    // iframe.style.position = 'absolute';

    /* ..more styling like that.. */
    // iframe.src = chrome.runtime.getURL('my_ui.html');
    // iframe.src = chrome.runtime.getURL('../iframe/index.html');
    // document.body.appendChild(iframe);
    injectNotificationIframe();
  };
}

/**
 * Determines if the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

/**
 * Checks the doctype of the current document if it exists
 */
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
