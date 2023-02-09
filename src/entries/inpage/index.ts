import { Ethereum } from '@wagmi/core';

import { initializeMessenger } from '~/core/messengers';
import { RainbowProvider } from '~/core/providers';
import { ChainId } from '~/core/types/chains';

import { injectNotificationIframe } from '../iframe';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
    rainbow: RainbowProvider;
    providers: (RainbowProvider | Ethereum)[];
    walletRouter: {
      rainbowProvider: RainbowProvider;
      lastInjectedProvider?: RainbowProvider;
      currentProvider?: RainbowProvider;
      providers: (RainbowProvider | Ethereum)[];
      setDefaultProvider: (rainbowAsDefault: boolean) => void;
      addProvider: (provider: RainbowProvider | Ethereum) => void;
    };
  }
}

const messenger = initializeMessenger({ connect: 'popup' });
const backgroundMessenger = initializeMessenger({ connect: 'background' });
const provider = new RainbowProvider({ messenger });

if (shouldInjectProvider()) {
  Object.defineProperty(window, 'rainbow', {
    value: provider,
    configurable: false,
    writable: false,
  });

  setTimeout(() => {
    Object.defineProperty(window, 'walletRouter', {
      value: {
        rainbowProvider: window.rainbow,
        lastInjectedProvider: window.ethereum,
        currentProvider: window.ethereum,
        providers: [
          window.rainbow,
          // eslint-disable-next-line no-nested-ternary
          ...(window.ethereum
            ? // let's use the providers that has already been registered
              // This format is used by coinbase wallet
              Array.isArray(window.providers)
              ? [...window.providers, window.ethereum]
              : [window.ethereum]
            : []),
        ],
        setDefaultProvider: (rainbowAsDefault: boolean) => {
          if (rainbowAsDefault) {
            window.walletRouter.currentProvider = window.rainbow;
            window.ethereum = window.rainbow;
          } else {
            window.walletRouter.currentProvider =
              window.walletRouter.lastInjectedProvider ?? window.ethereum;
            window.ethereum = window.walletRouter.currentProvider;
          }
        },
        addProvider: (provider: RainbowProvider | Ethereum) => {
          window.walletRouter.providers.push(provider);
        },
      },
      configurable: true,
      writable: false,
    });

    Object.defineProperty(window, 'ethereum', {
      value: new Proxy(window.walletRouter.currentProvider || {}, {}),
      set(newProvider) {
        if (window?.walletRouter.providers.includes(newProvider)) {
          window.walletRouter?.addProvider(newProvider);
        }
      },
      configurable: false,
      writable: true,
    });
  }, 100);

  // const walletRouter = (window.walletRouter = walletRouter);
  backgroundMessenger.reply(
    'rainbow_setDefaultProvider',
    async ({ rainbowAsDefault }: { rainbowAsDefault: boolean }) => {
      window.walletRouter.setDefaultProvider(rainbowAsDefault);
    },
  );
}

console.log('injection complete in window');
window.dispatchEvent(new Event('ethereum#initialized'));

backgroundMessenger.reply(
  'wallet_switchEthereumChain',
  async ({
    chainId,
    status,
    extensionUrl,
    host,
  }: {
    chainId: ChainId;
    status: 'success' | 'failed';
    extensionUrl: string;
    host: string;
  }) => {
    if (window.location.hostname === host) {
      injectNotificationIframe({ chainId, status, extensionUrl });
    }
  },
);

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
