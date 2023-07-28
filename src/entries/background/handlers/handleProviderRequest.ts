import { ToBufferInputTypes } from '@ethereumjs/util';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { isAddress } from '@ethersproject/address';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Address, UserRejectedRequestError } from 'wagmi';

import { event } from '~/analytics/event';
import { queueEventTracking } from '~/analytics/queueEvent';
import { hasVault, isPasswordSet } from '~/core/keychain';
import { Messenger } from '~/core/messengers';
import { appSessionsStore, notificationWindowStore } from '~/core/state';
import { pendingRequestStore } from '~/core/state/requests';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { isSupportedChainId } from '~/core/utils/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import { DEFAULT_CHAIN_ID } from '~/core/utils/defaults';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { toHex } from '~/core/utils/hex';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';
import { IN_DAPP_NOTIFICATION_STATUS } from '~/entries/iframe/notification';
import { RainbowError, logger } from '~/logger';

const createNewWindow = async (tabId: string) => {
  const { setNotificationWindow } = notificationWindowStore.getState();
  const currentWindow = await chrome.windows.getCurrent();
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html') + '?tabId=' + tabId,
    type: 'popup',
    height: POPUP_DIMENSIONS.height + 25,
    width: 360,
    left:
      (currentWindow.width || POPUP_DIMENSIONS.width) - POPUP_DIMENSIONS.width,
    top: 0,
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

  if (hasVault() && (await isPasswordSet())) {
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
    const { getActiveSession, addSession, updateSessionChainId } =
      appSessionsStore.getState();
    const url = meta?.sender?.url || '';
    const host = getDappHost(url);
    const dappName = meta.sender.tab?.title || host;
    const activeSession = getActiveSession({ host });

    try {
      let response = null;

      switch (method) {
        case 'eth_chainId': {
          response = activeSession
            ? toHex(String(activeSession.chainId))
            : DEFAULT_CHAIN_ID;
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
        case 'eth_sign':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4': {
          {
            // If we need to validate the input before showing the UI, it should go here.
            if (method === 'eth_signTypedData_v4') {
              // we don't trust the params order
              let dataParam = params?.[1];
              if (!isAddress(params?.[0] as Address)) {
                dataParam = params?.[0];
              }

              const data =
                typeof dataParam === 'string'
                  ? JSON.parse(dataParam)
                  : dataParam;

              const {
                domain: { chainId },
              } = data as { domain: { chainId: string } };

              if (Number(chainId) !== Number(activeSession?.chainId)) {
                throw new Error('ChainId mismatch');
              }
            }

            response = await messengerProviderRequest(popupMessenger, {
              method,
              id,
              params,
              meta,
            });
          }
          break;
        }
        case 'wallet_addEthereumChain': {
          const proposedChainId = (params?.[0] as { chainId: ChainId })
            ?.chainId;
          const supportedChainId = isSupportedChainId(Number(proposedChainId));
          if (!supportedChainId) throw new Error('Chain Id not supported');
          response = null;
          break;
        }
        case 'wallet_switchEthereumChain': {
          const proposedChainId = Number(
            (params?.[0] as { chainId: ChainId })?.chainId,
          );
          const supportedChainId = isSupportedChainId(Number(proposedChainId));
          const extensionUrl = chrome.runtime.getURL('');
          const activeSession = getActiveSession({ host });
          if (!supportedChainId || !activeSession) {
            inpageMessenger?.send('wallet_switchEthereumChain', {
              chainId: proposedChainId,
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
            updateSessionChainId({
              chainId: proposedChainId,
              host,
            });
            inpageMessenger?.send('wallet_switchEthereumChain', {
              chainId: proposedChainId,
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
          response = await provider.getBlock(params?.[0] as string);
          break;
        }
        case 'eth_getBalance': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.getBalance(params?.[0] as string);
          break;
        }
        case 'eth_getTransactionByHash': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.getTransaction(params?.[0] as string);
          break;
        }
        case 'eth_call': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.call(params?.[0] as TransactionRequest);
          break;
        }
        case 'eth_estimateGas': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.estimateGas(
            params?.[0] as TransactionRequest,
          );
          break;
        }
        case 'eth_gasPrice': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          response = await provider.getGasPrice();
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
            data: params?.[0] as ToBufferInputTypes,
            signature: params?.[1] as string,
          });
          break;
        }

        default: {
          try {
            if (method?.substring(0, 7) === 'wallet_') {
              // Generic error that will be hanlded correctly in the catch
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
