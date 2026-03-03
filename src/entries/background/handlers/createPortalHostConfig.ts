/**
 * Creates the config for processProviderRequest / handlePortalHost.
 * Shares logic with handleProviderRequest for consistency.
 */
import { Chain, UserRejectedRequestError } from 'viem';

import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { hasVault, isInitialized, isPasswordSet } from '~/core/keychain';
import { Messenger } from '~/core/messengers';
import {
  type ProcessProviderRequestConfig,
  ProviderErrorCodes,
  type ProviderRequestInput,
} from '~/core/provider/processProviderRequest';
import type {
  AddEthereumChainProposedChain,
  ProviderRequestMeta,
  ProviderRequestPayload,
} from '~/core/provider/types';
import { useAppSessionsStore, useNotificationWindowStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { usePendingRequestStore } from '~/core/state/requests';
import { SessionStorage } from '~/core/storage';
import { isCustomChain } from '~/core/utils/chains';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';
import { getProvider } from '~/core/viem/clientToProvider';
import { IN_DAPP_NOTIFICATION_STATUS } from '~/entries/iframe/notification';

const MAX_REQUEST_PER_SECOND = 10;
const MAX_REQUEST_PER_MINUTE = 90;
let minuteTimer: ReturnType<typeof setTimeout> | null = null;
let secondTimer: ReturnType<typeof setTimeout> | null = null;

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
  chrome.windows.update(windowId, { focused: true });
};

const openWindowForTabId = async (tabId: string) => {
  const { notificationWindows } = useNotificationWindowStore.getState();
  const notificationWindow = notificationWindows[tabId];
  if (notificationWindow) {
    chrome.windows.get(
      notificationWindow.id as number,
      async (existingWindow) => {
        if (chrome.runtime.lastError) {
          createNewWindow(tabId);
        } else if (existingWindow) {
          focusOnWindow(existingWindow.id as number);
        } else {
          createNewWindow(tabId);
        }
      },
    );
  } else {
    createNewWindow(tabId);
  }
};

const messengerProviderRequest = async (
  request: ProviderRequestInput,
): Promise<unknown> => {
  const { addPendingRequest, waitForPendingRequest } =
    usePendingRequestStore.getState();
  addPendingRequest(request as ProviderRequestPayload);

  let ready = isInitialized();
  while (!ready) {
    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 100));
    ready = isInitialized();
  }
  const _hasVault = ready && (await hasVault());
  const passwordSet = _hasVault && (await isPasswordSet());

  if (_hasVault && passwordSet) {
    openWindowForTabId(Number(request.meta?.sender?.tab?.id).toString());
  } else {
    goToNewTab({ url: WELCOME_URL });
  }

  const { status, payload } = await waitForPendingRequest(request.id);
  if (status === 'REJECTED') {
    throw new UserRejectedRequestError(Error('User rejected the request.'));
  }
  return payload as object;
};

const resetRateLimit = async (host: string, second: boolean) => {
  const rateLimits = await SessionStorage.get('rateLimits');
  if (rateLimits) {
    if (second && rateLimits[host]) {
      rateLimits[host].perSecond = 0;
    } else if (!second && rateLimits[host]) {
      rateLimits[host].perMinute = 0;
    }
    await SessionStorage.set('rateLimits', rateLimits);
  }
  if (second) secondTimer = null;
  else minuteTimer = null;
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

export function createPortalHostConfig(
  inpageMessenger: Messenger,
): ProcessProviderRequestConfig {
  return {
    getProvider,
    getActiveSession: ({ host }) =>
      useAppSessionsStore.getState().getActiveSession({ host }),
    getChainNativeCurrency: (chainId) =>
      useNetworkStore.getState().getChain(chainId)?.nativeCurrency,
    isSupportedChain: (chainId) =>
      !!useNetworkStore.getState().getBackendSupportedChain(chainId) ||
      isCustomChain(chainId),
    getFeatureFlags: () => ({ custom_rpc: true }),
    checkRateLimit: async ({ id, meta, method }) => {
      const url = meta?.sender?.url ?? '';
      const host = (isValidUrl(url) && getDappHost(url)) || '';
      const name = meta?.sender?.tab?.title ?? host;
      if (!skipRateLimitCheck(method)) {
        let rateLimits = await SessionStorage.get('rateLimits');
        if (!rateLimits) {
          rateLimits = { [host]: { perSecond: 0, perMinute: 0 } };
        }
        if (!rateLimits[host]) {
          rateLimits[host] = { perSecond: 1, perMinute: 1 };
        } else {
          rateLimits[host] = {
            perSecond: rateLimits[host].perSecond + 1,
            perMinute: rateLimits[host].perMinute + 1,
          };
        }
        if (!secondTimer) {
          secondTimer = setTimeout(() => resetRateLimit(host, true), 1000);
        }
        if (!minuteTimer) {
          minuteTimer = setTimeout(() => resetRateLimit(host, false), 60000);
        }
        await SessionStorage.set('rateLimits', rateLimits);
        if (rateLimits[host].perSecond > MAX_REQUEST_PER_SECOND) {
          queueEventTracking(event.dappProviderRateLimit, {
            dappURL: url,
            dappDomain: host,
            dappName: name,
            typeOfLimitHit: 'perSecond',
            requests: rateLimits[host].perSecond,
          });
          return {
            id,
            error: {
              code: ProviderErrorCodes.LIMIT_EXCEEDED.code,
              message: 'Rate Limit Exceeded',
              name: ProviderErrorCodes.LIMIT_EXCEEDED.name,
            },
          };
        }
        if (rateLimits[host].perMinute > MAX_REQUEST_PER_MINUTE) {
          queueEventTracking(event.dappProviderRateLimit, {
            dappURL: url,
            dappDomain: host,
            dappName: name,
            typeOfLimitHit: 'perMinute',
            requests: rateLimits[host].perMinute,
          });
          return {
            id,
            error: {
              code: ProviderErrorCodes.LIMIT_EXCEEDED.code,
              message: 'Rate Limit Exceeded',
              name: ProviderErrorCodes.LIMIT_EXCEEDED.name,
            },
          };
        }
      }
      return undefined;
    },
    messengerProviderRequest,
    onAddEthereumChain: ({ proposedChain, callbackOptions }) => {
      const url = callbackOptions?.sender?.url ?? '';
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
          addCustomChain(chainObject.id, chainObject, rpcUrl, false);
        }
        const rpcStatus = alreadyAddedRpcUrl
          ? isActiveRpc
            ? IN_DAPP_NOTIFICATION_STATUS.already_active
            : IN_DAPP_NOTIFICATION_STATUS.already_added
          : IN_DAPP_NOTIFICATION_STATUS.rpc_added;
        const extensionUrl = chrome.runtime.getURL('');
        inpageMessenger.send('rainbow_ethereumChainEvent', {
          chainId: Number(proposedChain.chainId),
          status: rpcStatus,
          extensionUrl,
          host,
        });
      }
      return { chainAlreadyAdded: !!alreadyAddedChain };
    },
    onSwitchEthereumChainNotSupported: ({ proposedChain, callbackOptions }) => {
      const url = callbackOptions?.sender?.url ?? '';
      const host = (isValidUrl(url) && getDappHost(url)) || '';
      const extensionUrl = chrome.runtime.getURL('');
      const proposedChainId = Number(proposedChain.chainId);
      const chain = useNetworkStore
        .getState()
        .getActiveRpcForChain(proposedChainId);
      const supportedChain =
        isCustomChain(proposedChainId) ||
        !!useNetworkStore.getState().getBackendSupportedChain(proposedChainId);
      inpageMessenger.send('rainbow_ethereumChainEvent', {
        chainId: proposedChainId,
        chainName: chain?.name ?? 'NO NAME',
        status: !supportedChain
          ? IN_DAPP_NOTIFICATION_STATUS.unsupported_network
          : IN_DAPP_NOTIFICATION_STATUS.no_active_session,
        extensionUrl,
        host,
      });
    },
    onSwitchEthereumChainSupported: ({
      proposedChain,
      callbackOptions,
    }: {
      proposedChain: AddEthereumChainProposedChain;
      callbackOptions?: ProviderRequestMeta;
    }) => {
      const url = callbackOptions?.sender?.url ?? '';
      const host = (isValidUrl(url) && getDappHost(url)) || '';
      const dappName = callbackOptions?.sender?.tab?.title ?? host;
      const extensionUrl = chrome.runtime.getURL('');
      const proposedChainId = Number(proposedChain.chainId);
      useAppSessionsStore.getState().updateActiveSessionChainId({
        chainId: proposedChainId,
        host,
      });
      const chain = useNetworkStore
        .getState()
        .getActiveRpcForChain(proposedChainId);
      inpageMessenger.send('rainbow_ethereumChainEvent', {
        chainId: proposedChainId,
        chainName: chain?.name,
        status: IN_DAPP_NOTIFICATION_STATUS.success,
        extensionUrl,
        host,
      });
      queueEventTracking(event.dappProviderNetworkSwitched, {
        dappURL: host,
        dappDomain: host,
        dappName,
        chainId: proposedChainId,
      });
      inpageMessenger.send(`chainChanged:${host}`, proposedChainId);
    },
    removeAppSession: ({ host }) => {
      inpageMessenger.send(`disconnect:${host}`, null);
      useAppSessionsStore.getState().removeAppSession({ host });
    },
  };
}
