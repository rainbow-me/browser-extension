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
    injectElement.id = 'bx-notification-iframe';

    document.body.appendChild(injectElement);

    // const link = document.createElement('link');

    // Set the attributes
    // for link element
    // link.href = '../popup/global.css';
    // link.rel = 'stylesheet';
    // link.type = 'text/css';

    // Set the link element at the
    // 'head' of HTML document
    // document.head.appendChild(link);

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
