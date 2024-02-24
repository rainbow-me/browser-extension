/* eslint-disable no-await-in-loop */
import { isHexPrefixed } from '@ethereumjs/util';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { isHexString } from '@ethersproject/bytes';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import { Chain, getProvider } from '@wagmi/core';
import { Address, UserRejectedRequestError } from 'wagmi';

import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { hasVault, isInitialized, isPasswordSet } from '~/core/keychain';
import { Messenger } from '~/core/messengers';
import { SUPPORTED_CHAINS } from '~/core/references';
import {
  appSessionsStore,
  notificationWindowStore,
  pendingRequestStore,
  rainbowChainsStore,
} from '~/core/state';
import { featureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { userChainsStore } from '~/core/state/userChains';
import { SessionStorage } from '~/core/storage';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import {
  deriveChainIdByHostname,
  isCustomChain,
  isSupportedChainId,
} from '~/core/utils/chains';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { DEFAULT_CHAIN_ID } from '~/core/utils/defaults';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { normalizeTransactionResponsePayload } from '~/core/utils/ethereum';
import { toHex } from '~/core/utils/hex';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';
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
  const { setNotificationWindow } = notificationWindowStore.getState();
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
  const { notificationWindows } = notificationWindowStore.getState();
  const notificationWindow = notificationWindows[tabId];
  if (notificationWindow) {
    chrome.windows.get(
      notificationWindow.id as number,
      async (existingWindow) => {
        if (chrome.runtime.lastError) {
          createNewWindow(tabId);
        } else {
          if (existingWindow) {
            focusOnWindow(existingWindow.id as number);
          } else {
            createNewWindow(tabId);
          }
        }
      },
    );
  } else {
    createNewWindow(tabId);
  }
};

/**
 * Uses extensionMessenger to send messages to popup for the user to approve or reject
 * @param {PendingRequest} request
 * @returns {boolean}
 */
const messengerProviderRequest = async (
  messenger: Messenger,
  request: ProviderRequestPayload,
) => {
  const { addPendingRequest } = pendingRequestStore.getState();
  // Add pending request to global background state.
  addPendingRequest(request);

  let ready = await isInitialized();
  while (!ready) {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 100));
    ready = await isInitialized();
  }
  const _hasVault = ready && (await hasVault());
  const passwordSet = _hasVault && (await isPasswordSet());

  if (_hasVault && passwordSet) {
    openWindowForTabId(Number(request.meta?.sender.tab?.id).toString());
  } else {
    goToNewTab({
      url: WELCOME_URL,
    });
  }
  // Wait for response from the popup.
  const payload: unknown | null = await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    messenger.reply(`message:${request.id}`, async (payload) =>
      resolve(payload),
    ),
  );
  if (!payload) {
    throw new UserRejectedRequestError('User rejected the request.');
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

const checkRateLimit = async (host: string) => {
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
        dappURL: host,
        typeOfLimitHit: 'perSecond',
        requests: rateLimits[host].perSecond,
      });
      return true;
    }

    if (rateLimits[host].perMinute > MAX_REQUEST_PER_MINUTE) {
      queueEventTracking(event.dappProviderRateLimit, {
        dappURL: host,
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
  providerRequestTransport.reply(async ({ method, id, params }, meta) => {
    const { getActiveSession, addSession, updateActiveSessionChainId } =
      appSessionsStore.getState();
    const url = meta?.sender?.url || '';
    const host = (isValidUrl(url) && getDappHost(url)) || '';
    const dappName = meta.sender.tab?.title || host;
    const activeSession = getActiveSession({ host });

    if (!skipRateLimitCheck(method)) {
      const rateLimited = await checkRateLimit(host);
      if (rateLimited) {
        return { id, error: <Error>new Error('Rate Limit Exceeded') };
      }
    }

    try {
      let response = null;

      switch (method) {
        case 'eth_chainId': {
          response = activeSession
            ? toHex(String(activeSession.chainId))
            : DEFAULT_CHAIN_ID;
          break;
        }
        case 'eth_coinbase': {
          response = activeSession ? activeSession.address?.toLowerCase() : '';
          break;
        }
        case 'eth_accounts': {
          response = activeSession
            ? [activeSession.address?.toLowerCase()]
            : [];
          break;
        }
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4': {
          // If we need to validate the input before showing the UI, it should go here.
          if (method === 'eth_signTypedData_v4') {
            // we don't trust the params order
            let dataParam = params?.[1];
            if (!isAddress(params?.[0] as Address)) {
              dataParam = params?.[0];
            }

            const data =
              typeof dataParam === 'string' ? JSON.parse(dataParam) : dataParam;

            const {
              domain: { chainId },
            } = data as { domain: { chainId: string } };

            if (
              chainId !== undefined &&
              Number(chainId) !== Number(activeSession?.chainId)
            ) {
              throw new Error('ChainId mismatch');
            }
          }

          response = await messengerProviderRequest(popupMessenger, {
            method,
            id,
            params,
            meta,
          });
          break;
        }
        case 'wallet_addEthereumChain': {
          console.log('wallet_addEthereumChain params', params);
          const { featureFlags } = featureFlagsStore.getState();
          const { rainbowChains, addCustomRPC, setActiveRPC } =
            rainbowChainsStore.getState();
          const { addUserChain } = userChainsStore.getState();
          const proposedChain = params?.[0] as {
            chainId: string;
            rpcUrls: string[];
            chainName: string;
            iconUrls: string[];
            nativeCurrency: {
              name: string;
              symbol: string;
              decimals: number;
            };
            blockExplorerUrls: string[];
          };
          const proposedChainId = Number(proposedChain.chainId);
          const alreadyAddedChain = Object.keys(rainbowChains).find(
            (id) => Number(id) === proposedChainId,
          );
          if (!featureFlags.custom_rpc) {
            const supportedChainId =
              isCustomChain(proposedChainId) ||
              isSupportedChainId(proposedChainId);
            if (!supportedChainId) throw new Error('Chain Id not supported');
          } else {
            const {
              chainId,
              rpcUrls: [rpcUrl],
              nativeCurrency: { name, symbol, decimals },
              blockExplorerUrls: [blockExplorerUrl],
            } = proposedChain;

            // Validate chain Id
            if (!isHexString(chainId) || !isHexPrefixed(chainId)) {
              throw new Error(
                `Expected 0x-prefixed, unpadded, non-zero hexadecimal string "chainId". Received: ${chainId}`,
              );
            } else if (Number(chainId) > Number.MAX_SAFE_INTEGER) {
              throw new Error(
                `Invalid chain ID "${chainId}": numerical value greater than max safe value. Received: ${chainId}`,
              );
              // Validate symbol and name
            } else if (!rpcUrl) {
              throw new Error(
                `Expected non-empty array[string] "rpcUrls". Received: ${rpcUrl}`,
              );
            } else if (!name || !symbol) {
              throw new Error(
                'Expected non-empty string "nativeCurrency.name", "nativeCurrency.symbol"',
              );
              // Validarte decimals
            } else if (
              !Number.isInteger(decimals) ||
              decimals < 0 ||
              decimals > 36
            ) {
              throw new Error(
                `Expected non-negative integer "nativeCurrency.decimals" less than 37. Received: ${decimals}`,
              );
              // Validate symbol length
            } else if (symbol.length < 2 || symbol.length > 6) {
              throw new Error(
                `Expected 2-6 character string 'nativeCurrency.symbol'. Received: ${symbol}`,
              );
              // Validate symbol against existing chains
            } else if (isSupportedChainId(Number(chainId))) {
              const knownChain = SUPPORTED_CHAINS.find(
                (chain) => chain.id === Number(chainId),
              );
              if (knownChain?.nativeCurrency.symbol !== symbol) {
                throw new Error(
                  `nativeCurrency.symbol does not match currency symbol for a network the user already has added with the same chainId. Received: ${symbol}`,
                );
              }
              // Validate blockExplorerUrl
            } else if (!blockExplorerUrl) {
              throw new Error(
                `Expected null or array with at least one valid string HTTPS URL 'blockExplorerUrl'. Received: ${blockExplorerUrl}`,
              );
            }

            if (alreadyAddedChain) {
              const chainObject: Chain = {
                id: proposedChainId,
                nativeCurrency: { name, symbol, decimals },
                name: proposedChain.chainName,
                network: proposedChain.chainName,
                rpcUrls: {
                  default: { http: [rpcUrl] },
                  public: { http: [rpcUrl] },
                },
                blockExplorers: {
                  default: { name: '', url: blockExplorerUrl },
                },
              };
              const rainbowChain = rainbowChains[chainObject.id];
              const alreadyAddedRpcUrl = rainbowChain.chains.find(
                (chain: Chain) =>
                  chain.rpcUrls.default.http[0] === rpcUrl &&
                  rainbowChain.activeRpcUrl === rpcUrl,
              );
              const activeRpc = rainbowChain.activeRpcUrl === rpcUrl;
              if (!alreadyAddedRpcUrl) {
                addCustomRPC({ chain: chainObject });
                addUserChain({ chainId: chainObject.id });
                setActiveRPC({
                  rpcUrl: rpcUrl,
                  chainId: chainObject.id,
                });
              }

              let rpcStatus;
              if (alreadyAddedRpcUrl) {
                if (activeRpc) {
                  rpcStatus = IN_DAPP_NOTIFICATION_STATUS.already_active;
                } else {
                  rpcStatus = IN_DAPP_NOTIFICATION_STATUS.already_added;
                }
              } else {
                rpcStatus = IN_DAPP_NOTIFICATION_STATUS.set_as_active;
              }

              const extensionUrl = chrome.runtime.getURL('');
              inpageMessenger?.send('rainbow_ethereumChainEvent', {
                chainId: proposedChainId,
                status: rpcStatus,
                extensionUrl,
                host,
              });
            } else {
              response = await messengerProviderRequest(popupMessenger, {
                method,
                id,
                params,
                meta,
              });
            }

            // PER EIP - return null if the network was added otherwise throw
            if (response !== null) {
              throw new Error('User rejected the request.');
            }
          }
          break;
        }
        case 'wallet_watchAsset': {
          const { featureFlags } = featureFlagsStore.getState();
          if (!featureFlags.custom_rpc && process.env.IS_TESTING === 'false') {
            throw new Error('Method not supported');
          } else {
            const {
              type,
              options: { address, symbol, decimals },
            } = params as unknown as {
              type: string;
              options: {
                address: Address;
                symbol?: string;
                decimals?: number;
              };
            };

            if (type !== 'ERC20') {
              throw new Error('Method supported only for ERC20');
            }

            if (!address) {
              throw new Error('Address is required');
            }

            const activeSession = getActiveSession({ host });
            let chainId = null;
            if (activeSession) {
              chainId = activeSession?.chainId;
            } else {
              chainId = deriveChainIdByHostname(host);
            }

            response = await messengerProviderRequest(popupMessenger, {
              method,
              id,
              params: [
                {
                  address,
                  symbol,
                  decimals,
                  chainId,
                },
              ],
              meta,
            });
            // PER EIP - true if the token was added, false otherwise.
            response = !!response;
            break;
          }
        }
        case 'wallet_switchEthereumChain': {
          const proposedChainId = Number(
            (params?.[0] as { chainId: ChainId })?.chainId,
          );
          const supportedChainId =
            isCustomChain(Number(proposedChainId)) ||
            isSupportedChainId(Number(proposedChainId));
          const extensionUrl = chrome.runtime.getURL('');
          const activeSession = getActiveSession({ host });
          if (!supportedChainId || !activeSession) {
            const chain = rainbowChainsStore
              .getState()
              .getActiveChain({ chainId: proposedChainId });
            inpageMessenger?.send('rainbow_ethereumChainEvent', {
              chainId: proposedChainId,
              chainName: chain?.name || 'NO NAME',
              status: !supportedChainId
                ? IN_DAPP_NOTIFICATION_STATUS.unsupported_network
                : IN_DAPP_NOTIFICATION_STATUS.no_active_session,
              extensionUrl,
              host,
            });
            logger.error(new RainbowError('Chain Id not supported'), {
              proposedChainId,
              host,
            });
            throw new Error('Chain Id not supported');
          } else {
            updateActiveSessionChainId({
              chainId: proposedChainId,
              host,
            });
            const chain = rainbowChainsStore
              .getState()
              .getActiveChain({ chainId: proposedChainId });
            inpageMessenger?.send('rainbow_ethereumChainEvent', {
              chainId: proposedChainId,
              chainName: chain?.name,
              status: IN_DAPP_NOTIFICATION_STATUS.success,
              extensionUrl,
              host,
            });
            queueEventTracking(event.dappProviderNetworkSwitched, {
              dappURL: host,
              dappName,
              chainId: proposedChainId,
            });
            inpageMessenger.send(`chainChanged:${host}`, proposedChainId);
          }
          response = null;
          break;
        }
        case 'eth_requestAccounts': {
          if (activeSession) {
            response = [activeSession.address?.toLowerCase()];
            break;
          }
          const { address, chainId } = (await messengerProviderRequest(
            popupMessenger,
            {
              method,
              id,
              params,
              meta,
            },
          )) as { address: Address; chainId: number };
          addSession({
            host,
            address,
            chainId,
            url,
          });
          response = [address?.toLowerCase()];
          break;
        }
        case 'eth_blockNumber': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const blockNumber = await provider.getBlockNumber();
          response = toHex(String(blockNumber));
          break;
        }
        case 'eth_getBlockByNumber': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const block = await provider.getBlock(params?.[0] as string);
          response = {
            ...block,
            baseFeePerGas: toHex(block?.baseFeePerGas?.toString() || ''),
            gasLimit: toHex(block?.gasLimit?.toString() || ''),
            gasUsed: toHex(block?.gasUsed?.toString() || ''),
            _difficulty: toHex(block?._difficulty?.toString() || ''),
          };
          break;
        }
        case 'eth_getBalance': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const balance = await provider.getBalance(params?.[0] as string);
          response = toHex(balance.toString());
          break;
        }
        case 'eth_getTransactionByHash': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const transaction = await provider.getTransaction(
            params?.[0] as string,
          );
          const normalizedTransaction =
            normalizeTransactionResponsePayload(transaction);
          const {
            gasLimit,
            gasPrice,
            maxFeePerGas,
            maxPriorityFeePerGas,
            value,
          } = normalizedTransaction;
          response = {
            ...normalizedTransaction,
            gasLimit: toHex(gasLimit.toString()),
            gasPrice: gasPrice ? toHex(gasPrice.toString()) : undefined,
            maxFeePerGas: maxFeePerGas
              ? toHex(maxFeePerGas.toString())
              : undefined,
            maxPriorityFeePerGas: maxPriorityFeePerGas
              ? toHex(maxPriorityFeePerGas.toString())
              : undefined,
            value: toHex(value.toString()),
          };
          break;
        }
        case 'eth_call': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.call(params?.[0] as TransactionRequest);
          break;
        }
        case 'eth_estimateGas': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const gas = await provider.estimateGas(
            params?.[0] as TransactionRequest,
          );
          response = toHex(gas.toString());
          break;
        }
        case 'eth_gasPrice': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const gasPrice = await provider.getGasPrice();
          response = toHex(gasPrice.toString());
          break;
        }
        case 'eth_getCode': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.getCode(
            params?.[0] as string,
            params?.[1] as string,
          );
          break;
        }
        case 'personal_ecRecover': {
          response = recoverPersonalSignature({
            data: params?.[0] as string,
            signature: params?.[1] as string,
          });
          break;
        }

        default: {
          try {
            if (method?.substring(0, 7) === 'wallet_') {
              // Generic error that will be handled correctly in the catch
              throw new Error('next');
            }
            // Let's try to fwd the request to the provider
            const provider = getProvider({
              chainId: activeSession?.chainId,
            }) as StaticJsonRpcProvider;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response = await provider.send(method, params as any[]);
          } catch (e) {
            // TODO: handle other methods
            logger.error(new RainbowError('Unhandled provider request'), {
              dappURL: host,
              dappName,
              method,
            });
            throw new Error('Method not supported');
          }
        }
      }
      return { id, result: response };
    } catch (error) {
      return { id, error: <Error>error };
    }
  });
