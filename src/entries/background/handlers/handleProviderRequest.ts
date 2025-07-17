import {
  AddEthereumChainProposedChain,
  handleProviderRequest as rnbwHandleProviderRequest,
} from '@rainbow-me/provider';
import { Chain, UserRejectedRequestError } from 'viem';

import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { hasVault, isInitialized, isPasswordSet } from '~/core/keychain';
import { Messenger } from '~/core/messengers';
import { CallbackOptions } from '~/core/messengers/internal/createMessenger';
import {
  useAppSessionsStore,
  useNotificationWindowStore,
  usePendingRequestStore,
} from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { getSenderHost, getTabIdString } from '~/core/state/requests/utils';
import { SessionStorage } from '~/core/storage';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { isCustomChain } from '~/core/utils/chains';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { IN_DAPP_NOTIFICATION_STATUS } from '~/entries/iframe/notification';
import { RainbowError, logger } from '~/logger';

const MAX_REQUEST_PER_SECOND = 10;
const MAX_REQUEST_PER_MINUTE = 90;
let minuteTimer: NodeJS.Timeout | null = null;
let secondTimer: NodeJS.Timeout | null = null;

const getPopupTitleBarHeight = (platform: string) => {
  if (platform.includes('Mac')) return 28;
  if (platform.includes('Win')) return 30;
  if (platform.includes('Linux')) return 32;
  return 28;
};

const createNewWindow = async (tabId: string) => {
  const { setNotificationWindow } = useNotificationWindowStore.getState();
  const currentWindow = await chrome.windows.getCurrent();
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html') + '?tabId=' + tabId,
    type: 'popup',
    height:
      POPUP_DIMENSIONS.height + getPopupTitleBarHeight(navigator.userAgent),
    width: POPUP_DIMENSIONS.width,
    left:
      (currentWindow.left || 0) +
      (currentWindow.width || POPUP_DIMENSIONS.width) -
      POPUP_DIMENSIONS.width,
    top: currentWindow.top || 0,
  });
  setNotificationWindow(tabId, window);
};

const focusOnWindow = (windowId: number) => {
  chrome.windows.update(windowId, {
    focused: true,
  });
};

const openWindowForTabId = async (tabId: string) => {
  const { notificationWindows } = useNotificationWindowStore.getState();
  const notificationWindow = notificationWindows[tabId];
  if (notificationWindow?.id) {
    chrome.windows.get(notificationWindow.id, async (existingWindow) => {
      if (chrome.runtime.lastError) {
        createNewWindow(tabId);
      } else {
        if (existingWindow.id) {
          focusOnWindow(existingWindow.id);
        } else {
          createNewWindow(tabId);
        }
      }
    });
  } else {
    createNewWindow(tabId);
  }
};

const resolveConnectionRequestsIfNeeded = (
  request: ProviderRequestPayload,
  payload: unknown,
) => {
  if (request.method !== 'eth_requestAccounts') return;
  const host = getSenderHost(request);
  if (!host) return;
  const { resolveConnectionRequests } = usePendingRequestStore.getState();
  if (payload) {
    resolveConnectionRequests(host, payload);
  } else {
    resolveConnectionRequests(
      host,
      new UserRejectedRequestError(Error('User rejected the request.')),
      true,
    );
  }
};

/**
 * Creates a promise that will be resolved when the connection request for this host completes.
 * This allows multiple eth_requestAccounts calls from the same host to wait for a single user decision.
 */
const handleConnectionResolver = (
  host: string,
  addConnectionResolver: (
    host: string,
    resolver: {
      resolve: (value: object) => void;
      reject: (error: Error) => void;
    },
  ) => void,
): Promise<object> => {
  return new Promise((resolve, reject) => {
    addConnectionResolver(host, { resolve, reject });
  });
};

/**
 * Resolves all queued connection requests for the same host when a connection request completes.
 * This ensures that multiple eth_requestAccounts calls from the same host all get the same result.
 */
/**
 * Waits for the extension to be fully initialized.
 * This is required for inpage script bootup delays to avoid race conditions.
 */
const waitForInitialized = async (): Promise<void> => {
  while (!isInitialized()) {
    // eslint-disable-next-line no-promise-executor-return, no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

/**
 * Uses extensionMessenger to send messages to popup for the user to approve or reject
 * @param {PendingRequest} request
 * @returns {object}
 */
const messengerProviderRequest = async (
  messenger: Messenger,
  request: ProviderRequestPayload,
) => {
  const { addPendingRequest, addConnectionResolver } =
    usePendingRequestStore.getState();

  // Attempt to add the request - this implements deduplication for eth_requestAccounts
  const isRequestAdded = addPendingRequest(request);

  if (!isRequestAdded) {
    // This is a duplicate connection request from the same host+tab.
    // Instead of creating a new popup, we focus the existing one and queue
    // this request to be resolved when the original request completes.
    const host = getSenderHost(request);
    const tabId = getTabIdString(request);
    if (host && tabId) {
      openWindowForTabId(tabId);
      return handleConnectionResolver(host, addConnectionResolver);
    }
  }

  // Wait for initialization - required for inpage script bootup delays
  await waitForInitialized();
  const _hasVault = await hasVault();
  const passwordSet = _hasVault && (await isPasswordSet());

  const tabId = getTabIdString(request);
  if (_hasVault && passwordSet && tabId) {
    openWindowForTabId(tabId);
  } else {
    goToNewTab({ url: WELCOME_URL });
  }

  // Wait for response from the popup.
  const payload: unknown | null = await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    messenger.reply(`message:${request.id}`, async (payload) => {
      resolve(payload);
      resolveConnectionRequestsIfNeeded(request, payload);
    }),
  );

  if (!payload) {
    throw new UserRejectedRequestError(Error('User rejected the request.'));
  }
  return payload;
};

const resetRateLimit = async (host: string, second: boolean) => {
  const rateLimits = await SessionStorage.get('rateLimits');
  if (second) {
    if (rateLimits[host]) {
      rateLimits[host].perSecond = 0;
    }
    secondTimer = null;
  } else {
    if (rateLimits[host]) {
      rateLimits[host].perMinute = 0;
    }
    minuteTimer = null;
  }
  return SessionStorage.set('rateLimits', rateLimits);
};

const checkRateLimit = async ({
  url,
  host,
  name,
}: {
  url: string;
  host: string;
  name: string;
}) => {
  try {
    // Read from session
    let rateLimits = await SessionStorage.get('rateLimits');

    // Initialize if needed
    if (rateLimits === undefined) {
      rateLimits = {
        [host]: {
          perSecond: 0,
          perMinute: 0,
        },
      };
    }

    if (rateLimits[host] === undefined) {
      rateLimits[host] = {
        perSecond: 1,
        perMinute: 1,
      };
    } else {
      rateLimits[host] = {
        perSecond: rateLimits[host].perSecond + 1,
        perMinute: rateLimits[host].perMinute + 1,
      };
    }

    // Clear after 1 sec
    if (!secondTimer) {
      secondTimer = setTimeout(async () => {
        resetRateLimit(host, true);
      }, 1000);
    }

    if (!minuteTimer) {
      minuteTimer = // Clear after 1 min
        setTimeout(async () => {
          resetRateLimit(host, false);
        }, 60000);
    }

    // Write to session
    SessionStorage.set('rateLimits', rateLimits);

    // Check rate limits
    if (rateLimits[host].perSecond > MAX_REQUEST_PER_SECOND) {
      queueEventTracking(event.dappProviderRateLimit, {
        dappURL: url,
        dappDomain: host,
        dappName: name,
        typeOfLimitHit: 'perSecond',
        requests: rateLimits[host].perSecond,
      });
      return true;
    }

    if (rateLimits[host].perMinute > MAX_REQUEST_PER_MINUTE) {
      queueEventTracking(event.dappProviderRateLimit, {
        dappURL: url,
        dappDomain: host,
        dappName: name,
        typeOfLimitHit: 'perMinute',
        requests: rateLimits[host].perMinute,
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

const skipRateLimitCheck = (method: string) =>
  [
    'eth_chainId',
    'eth_accounts',
    'eth_sendTransaction',
    'eth_signTransaction',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'wallet_watchAsset',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain',
    'eth_requestAccounts',
    'personal_ecRecover',
  ].includes(method) || method.startsWith('wallet_');

/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = ({
  popupMessenger,
  inpageMessenger,
}: {
  popupMessenger: Messenger;
  inpageMessenger: Messenger;
}) =>
  rnbwHandleProviderRequest({
    providerRequestTransport: providerRequestTransport,
    isSupportedChain: (chainId: number) =>
      !!useNetworkStore.getState().getBackendSupportedChain(chainId) ||
      isCustomChain(chainId),
    getActiveSession: ({ host }: { host: string }) =>
      useAppSessionsStore.getState().getActiveSession({ host }),
    removeAppSession: ({ host }: { host: string }) =>
      useAppSessionsStore.getState().removeAppSession({ host }),
    getChainNativeCurrency: (chainId: number) =>
      useNetworkStore.getState().getBackendSupportedChains(true)[chainId]
        ?.nativeCurrency,
    getFeatureFlags: () => ({
      // TODO: Populate with the remote config feature flag
      custom_rpc: true,
    }),
    getProvider: getProvider,
    messengerProviderRequest: (request: ProviderRequestPayload) =>
      messengerProviderRequest(popupMessenger, request),
    onAddEthereumChain: ({
      proposedChain,
      callbackOptions,
    }: {
      proposedChain: AddEthereumChainProposedChain;
      callbackOptions?: CallbackOptions;
    }): { chainAlreadyAdded: boolean } => {
      const url = callbackOptions?.sender.url || '';
      const host = (isValidUrl(url) && getDappHost(url)) || '';
      const { getAllChains, addCustomChain } = useNetworkStore.getState();

      const allChains = getAllChains(true);
      const alreadyAddedChain = allChains[+proposedChain.chainId];
      if (alreadyAddedChain) {
        const {
          chainId,
          rpcUrls: [rpcUrl],
          nativeCurrency: { name, symbol, decimals },
          blockExplorerUrls: [blockExplorerUrl],
        } = proposedChain;
        const chainObject: Chain = {
          id: Number(chainId),
          nativeCurrency: { name, symbol, decimals },
          name: proposedChain.chainName,
          rpcUrls: {
            default: { http: [rpcUrl] },
            public: { http: [rpcUrl] },
          },
          blockExplorers: {
            default: { name: '', url: blockExplorerUrl },
          },
        };
        const rainbowChain = allChains[chainObject.id];
        const alreadyAddedRpcUrl = rainbowChain.rpcs[rpcUrl];
        const isActiveRpc = rainbowChain.activeRpcUrl === rpcUrl;

        if (!alreadyAddedRpcUrl) {
          addCustomChain(chainObject.id, chainObject, rpcUrl, true);
        }

        let rpcStatus;
        if (alreadyAddedRpcUrl) {
          if (isActiveRpc) {
            rpcStatus = IN_DAPP_NOTIFICATION_STATUS.already_active;
          } else {
            rpcStatus = IN_DAPP_NOTIFICATION_STATUS.already_added;
          }
        } else {
          rpcStatus = IN_DAPP_NOTIFICATION_STATUS.set_as_active;
        }

        const extensionUrl = chrome.runtime.getURL('');
        inpageMessenger?.send('rainbow_ethereumChainEvent', {
          chainId: Number(proposedChain.chainId),
          status: rpcStatus,
          extensionUrl,
          host,
        });
      }
      return { chainAlreadyAdded: !!alreadyAddedChain };
    },
    checkRateLimit: async ({
      id,
      meta,
      method,
    }: {
      id: number;
      meta: CallbackOptions;
      method: string;
    }) => {
      const url = meta?.sender.url || '';
      const host = (isValidUrl(url) && getDappHost(url)) || '';
      const name = meta?.sender.tab?.title || host;
      if (!skipRateLimitCheck(method)) {
        const rateLimited = await checkRateLimit({ url, host, name });
        if (rateLimited) {
          return { id, error: <Error>new Error('Rate Limit Exceeded') };
        }
      }
    },
    onSwitchEthereumChainNotSupported: ({
      proposedChain,
      callbackOptions,
    }: {
      proposedChain: AddEthereumChainProposedChain;
      callbackOptions?: CallbackOptions;
    }) => {
      const url = callbackOptions?.sender.url || '';
      const host = (isValidUrl(url || '') && getDappHost(url)) || '';
      const extensionUrl = chrome.runtime.getURL('');
      const proposedChainId = Number(proposedChain.chainId);
      const chain = useNetworkStore
        .getState()
        .getActiveRpcForChain(proposedChainId);
      const supportedChain =
        isCustomChain(proposedChainId) ||
        !!useNetworkStore.getState().getBackendSupportedChain(proposedChainId);

      inpageMessenger?.send('rainbow_ethereumChainEvent', {
        chainId: proposedChainId,
        chainName: chain?.name || 'NO NAME',
        status: !supportedChain
          ? IN_DAPP_NOTIFICATION_STATUS.unsupported_network
          : IN_DAPP_NOTIFICATION_STATUS.no_active_session,
        extensionUrl,
        host,
      });
      logger.error(new RainbowError('Chain Id not supported'), {
        proposedChainId,
        host,
      });
    },
    onSwitchEthereumChainSupported: ({
      proposedChain,
      callbackOptions,
    }: {
      proposedChain: AddEthereumChainProposedChain;
      callbackOptions?: CallbackOptions;
    }) => {
      const url = callbackOptions?.sender.url || '';
      const host = (isValidUrl(url || '') && getDappHost(url)) || '';
      const dappName = callbackOptions?.sender.tab?.title || host;
      const extensionUrl = chrome.runtime.getURL('');
      const proposedChainId = Number(proposedChain.chainId);
      const { updateActiveSessionChainId } = useAppSessionsStore.getState();
      updateActiveSessionChainId({
        chainId: proposedChainId,
        host,
      });
      const chain = useNetworkStore
        .getState()
        .getActiveRpcForChain(proposedChainId);
      inpageMessenger?.send('rainbow_ethereumChainEvent', {
        chainId: proposedChainId,
        chainName: chain?.name,
        status: IN_DAPP_NOTIFICATION_STATUS.success,
        extensionUrl,
        host,
      });
      queueEventTracking(event.dappProviderNetworkSwitched, {
        dappURL: host,
        dappDomain: host,
        dappName: dappName,
        chainId: proposedChainId,
      });
      inpageMessenger.send(`chainChanged:${host}`, proposedChainId);
    },
  });
