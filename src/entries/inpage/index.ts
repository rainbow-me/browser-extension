/**
 * Inpage script - injected into dapps
 *
 * Creates the window.ethereum provider using viem-inpage + viem-portal.
 */

import { uuid4 } from '@sentry/core';
import _ from 'lodash';
import { EIP1193Provider, announceProvider } from 'mipd';
import { type Eip1193Provider, createEip1193Provider } from 'viem-inpage';
import {
  type PortalClient,
  createClient,
  createWindowTransport,
} from 'viem-portal';

import { RAINBOW_ICON_RAW_SVG } from '~/core/references/rawImages';

type InpageSchema = {
  eth_request: {
    params: [method: string, params?: unknown[]];
    result: unknown;
  };
};

declare global {
  interface Window {
    ethereum: Eip1193Provider;
    lodash: unknown;
    rainbow: Eip1193Provider;
    providers: Eip1193Provider[];
    rnbwWalletRouter: {
      rainbowProvider: Eip1193Provider;
      lastInjectedProvider?: Eip1193Provider;
      currentProvider: Eip1193Provider;
      providers: Eip1193Provider[];
      setDefaultProvider: (rainbowAsDefault: boolean) => void;
      addProvider: (provider: Eip1193Provider) => void;
    };
  }
}

window.lodash = _.noConflict();

const portalClient: PortalClient<InpageSchema> = createClient<InpageSchema>(
  createWindowTransport(),
);

// Route all EIP-1193 requests through the portal's eth_request handler.
// createEip1193Provider calls client.request({ method, params }) (viem object-style)
// which is incompatible with the portal client's positional args interface.
const rainbowProvider = createEip1193Provider(
  portalClient as Parameters<typeof createEip1193Provider>[0],
);
rainbowProvider.request = async (args: {
  method: string;
  params?: unknown[];
}) => {
  return portalClient.request('eth_request', args.method, args.params);
};

if (shouldInjectProvider()) {
  // Create a copy without isMetaMask for EIP-6963
  const providerCopy = Object.create(
    Object.getPrototypeOf(rainbowProvider),
    Object.getOwnPropertyDescriptors(rainbowProvider),
  );
  providerCopy.isMetaMask = false;

  announceProvider({
    info: {
      icon: RAINBOW_ICON_RAW_SVG,
      name: 'Rainbow',
      rdns: 'me.rainbow',
      uuid: uuid4(),
    },
    provider: providerCopy as EIP1193Provider,
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
        addProvider(provider: Eip1193Provider) {
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
}

/**
 * Check if provider should be injected
 */
function shouldInjectProvider(): boolean {
  // Check doctype
  const { doctype } = window.document;
  if (doctype && doctype.name !== 'html') return false;

  // Check file extension
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const pathname = window.location.pathname;
  if (prohibitedTypes.some((rx) => rx.test(pathname))) return false;

  // Check document element
  const nodeName = document.documentElement.nodeName;
  if (nodeName && nodeName.toLowerCase() !== 'html') return false;

  return true;
}
