import { RainbowProvider } from '@rainbow-me/provider';
import { uuid4 } from '@sentry/utils';
import _ from 'lodash';
import { EIP1193Provider, announceProvider } from 'mipd';

import { initializeMessenger } from '~/core/messengers';
import { RAINBOW_ICON_RAW_SVG } from '~/core/references/rawImages';
import { providerRequestTransport } from '~/core/transports';
import { ChainId } from '~/core/types/chains';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { toHex } from '~/core/utils/hex';

import { injectNotificationIframe } from '../iframe';
import { IN_DAPP_NOTIFICATION_STATUS } from '../iframe/notification';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - clashes with Wagmi's Window type https://github.com/wagmi-dev/wagmi/blob/a25ddf534781b2da81ee6aba307b93750efc5595/packages/core/src/types/index.ts#L77
    ethereum: RainbowProvider;
    lodash: unknown;
    rainbow: RainbowProvider;
    providers: RainbowProvider[];
    rnbwWalletRouter: {
      rainbowProvider: RainbowProvider;
      lastInjectedProvider?: RainbowProvider;
      currentProvider: RainbowProvider;
      providers: RainbowProvider[];
      setDefaultProvider: (rainbowAsDefault: boolean) => void;
      addProvider: (provider: RainbowProvider) => void;
    };
  }
}

window.lodash = _.noConflict();

const backgroundMessenger = initializeMessenger({ connect: 'background' });
const messenger = initializeMessenger({ connect: 'popup' });

const rainbowProvider = new RainbowProvider({
  backgroundMessenger,
  providerRequestTransport: providerRequestTransport,
  onConstruct({ emit }) {
    // RainbowInjectedProvider is also used in popup via RainbowConnector
    // here we don't need to listen to anything so we don't need these listeners
    if (isValidUrl(window.location.href)) {
      const host = getDappHost(window.location.href);
      messenger?.reply(`accountsChanged:${host}`, async (address) => {
        emit('accountsChanged', [address]);
      });
      messenger?.reply(`chainChanged:${host}`, async (chainId: number) => {
        emit('chainChanged', toHex(String(chainId)));
      });
      messenger?.reply(`disconnect:${host}`, async () => {
        emit('accountsChanged', []);
        emit('disconnect', []);
      });
      messenger?.reply(`connect:${host}`, async (connectionInfo) => {
        emit('connect', connectionInfo);
      });
    }
  },
});

if (shouldInjectProvider()) {
  announceProvider({
    info: {
      icon: RAINBOW_ICON_RAW_SVG,
      name: 'Rainbow',
      rdns: 'me.rainbow',
      uuid: uuid4(),
    },
    provider: rainbowProvider as EIP1193Provider,
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
        addProvider(provider: RainbowProvider) {
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
