import { uuid4 } from '@sentry/core';
import _ from 'lodash';
import { EIP1193Provider, announceProvider } from 'mipd';
import { createEip1193Provider } from 'viem-inpage';
import { createClient, createWindowTransport } from 'viem-portal';

import { initializeMessenger } from '~/core/messengers';
import { RAINBOW_ICON_RAW_SVG } from '~/core/references/rawImages';
import { ChainId } from '~/core/types/chains';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { toHex } from '~/core/utils/hex';

import { injectNotificationIframe } from '../iframe';
import { IN_DAPP_NOTIFICATION_STATUS } from '../iframe/notification';

type RainbowEip1193Provider = ReturnType<typeof createEip1193Provider>;

declare global {
  interface Window {
    ethereum: RainbowEip1193Provider;
    lodash: unknown;
    rainbow: RainbowEip1193Provider;
    providers: RainbowEip1193Provider[];
    rnbwWalletRouter: {
      rainbowProvider: RainbowEip1193Provider;
      lastInjectedProvider?: RainbowEip1193Provider;
      currentProvider: RainbowEip1193Provider;
      providers: RainbowEip1193Provider[];
      setDefaultProvider: (rainbowAsDefault: boolean) => void;
      addProvider: (provider: RainbowEip1193Provider) => void;
    };
  }
}

window.lodash = _.noConflict();

const backgroundMessenger = initializeMessenger({ connect: 'background' });

// viem-portal: EthRpcSchema uses eth_request with params [method, params]
type ProviderSchema = {
  eth_request: {
    params: [method: string, params?: unknown[]];
    result: unknown;
  };
};

const windowTransport = createWindowTransport();
const portalClient = createClient<ProviderSchema>(windowTransport);

const portalRequestAdapter = {
  request: (args: { method: string; params?: unknown[] }) =>
    portalClient.request('eth_request', args.method, args.params ?? []),
};

const rainbowProvider = createEip1193Provider(portalRequestAdapter, {
  isRainbow: true,
  isMetaMask: true,
});

// Wire up event listeners for accountsChanged, chainChanged, disconnect, connect
if (isValidUrl(window.location.href)) {
  const host = getDappHost(window.location.href);
  backgroundMessenger?.reply(
    `accountsChanged:${host}`,
    async (address: string) => {
      rainbowProvider.emit('accountsChanged', [address]);
    },
  );
  backgroundMessenger?.reply(
    `chainChanged:${host}`,
    async (chainId: number) => {
      rainbowProvider.emit('chainChanged', toHex(String(chainId)));
    },
  );
  backgroundMessenger?.reply(`disconnect:${host}`, async () => {
    rainbowProvider.emit('accountsChanged', []);
    rainbowProvider.emit('disconnect', []);
  });
  backgroundMessenger?.reply(
    `connect:${host}`,
    async (connectionInfo: unknown) => {
      rainbowProvider.emit('connect', connectionInfo);
    },
  );
}

// Wrap request to prefetch before each call
const originalRequest = rainbowProvider.request.bind(rainbowProvider);
rainbowProvider.request = async (args: {
  method: string;
  params?: unknown[];
}) => {
  backgroundMessenger?.send(
    'rainbow_prefetchDappMetadata',
    window.location.href,
  );
  return originalRequest(args);
};

if (shouldInjectProvider()) {
  // eslint-disable-next-line prefer-object-spread
  const providerCopy = Object.create(
    Object.getPrototypeOf(rainbowProvider),
    Object.getOwnPropertyDescriptors(rainbowProvider),
  );
  (providerCopy as { isMetaMask: boolean }).isMetaMask = false;
  announceProvider({
    info: {
      icon: RAINBOW_ICON_RAW_SVG,
      name: 'Rainbow',
      rdns: 'me.rainbow',
      uuid: uuid4(),
    },
    provider: providerCopy as unknown as EIP1193Provider,
  });

  backgroundMessenger.reply(
    'rainbow_ethereumChainEvent',
    async ({
      chainId,
      chainName,
      status,
      extensionUrl,
      host,
    }: {
      chainId: ChainId;
      chainName?: string;
      status: IN_DAPP_NOTIFICATION_STATUS;
      extensionUrl: string;
      host: string;
    }) => {
      if (getDappHost(window.location.href) === host) {
        injectNotificationIframe({ chainId, chainName, status, extensionUrl });
      }
    },
  );

  backgroundMessenger.reply('rainbow_reload', async () => {
    window.location.reload();
  });

  Object.defineProperties(window, {
    rainbow: {
      value: rainbowProvider,
      configurable: false,
      writable: false,
    },
    ethereum: {
      get() {
        return window.rnbwWalletRouter.currentProvider;
      },
      set(newProvider) {
        window.rnbwWalletRouter?.addProvider(newProvider);
      },
      configurable: false,
    },
    rnbwWalletRouter: {
      value: {
        rainbowProvider,
        lastInjectedProvider: window.ethereum,
        currentProvider: rainbowProvider,
        providers: [
          rainbowProvider,
          ...(window.ethereum ? [window.ethereum] : []),
        ],
        setDefaultProvider(rainbowAsDefault: boolean) {
          if (rainbowAsDefault) {
            window.rnbwWalletRouter.currentProvider = window.rainbow;
          } else {
            const nonDefaultProvider =
              window.rnbwWalletRouter?.lastInjectedProvider ?? window.ethereum;
            window.rnbwWalletRouter.currentProvider = nonDefaultProvider;
          }
        },
        addProvider(provider: RainbowEip1193Provider) {
          if (!window.rnbwWalletRouter?.providers?.includes(provider)) {
            window.rnbwWalletRouter?.providers?.push(provider);
          }
          if (rainbowProvider !== provider) {
            window.rnbwWalletRouter.lastInjectedProvider = provider;
          }
        },
      },
      configurable: false,
      writable: false,
    },
  });

  window.dispatchEvent(new Event('ethereum#initialized'));

  backgroundMessenger.reply(
    'rainbow_setDefaultProvider',
    async ({ rainbowAsDefault }: { rainbowAsDefault: boolean }) => {
      window.rnbwWalletRouter?.setDefaultProvider(rainbowAsDefault);
    },
  );
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
