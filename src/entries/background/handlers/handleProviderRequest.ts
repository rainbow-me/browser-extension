import { ToBufferInputTypes } from '@ethereumjs/util';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Address, UserRejectedRequestError } from 'wagmi';

import { hasVault, isPasswordSet } from '~/core/keychain';
import { Messenger } from '~/core/messengers';
import {
  appSessionsStore,
  notificationWindowStore,
  pendingRequestStore,
} from '~/core/state';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { isSupportedChainId } from '~/core/utils/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import { DEFAULT_CHAIN_ID } from '~/core/utils/defaults';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { toHex } from '~/core/utils/numbers';
import { WELCOME_URL, goToNewTab } from '~/core/utils/tabs';

const openWindow = async () => {
  const { setWindow } = notificationWindowStore.getState();
  const currentWindow = await chrome.windows.getCurrent();
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    height: POPUP_DIMENSIONS.height + 25,
    width: 360,
    left:
      (currentWindow.width || POPUP_DIMENSIONS.width) - POPUP_DIMENSIONS.width,
    top: 0,
  });
  chrome.windows.onRemoved.addListener((id) => {
    if (id === window.id) {
      setWindow(null);
    }
  });
  setWindow(window);
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
    openWindow();
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
    console.log(meta.sender, method);

    const { getActiveSession, addSession, updateSessionChainId } =
      appSessionsStore.getState();
    const url = meta?.sender?.url || '';
    const host = getDappHost(url);
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
          response = activeSession ? [activeSession.address] : [];
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
          if (!supportedChainId) {
            inpageMessenger?.send('wallet_switchEthereumChain', {
              chainId: proposedChainId,
              status: 'failed',
              extensionUrl,
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
              status: 'success',
              extensionUrl,
              host,
            });
            inpageMessenger.send(`chainChanged:${host}`, proposedChainId);
          }
          response = null;
          break;
        }
        case 'eth_requestAccounts': {
          if (activeSession) {
            response = [activeSession.address];
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
          response = [address];
          break;
        }
        case 'eth_blockNumber': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const blockNumber = await provider.getBlockNumber();
          response = toHex(String(blockNumber));
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
          // TODO: handle other methods
        }
      }
      console.log('responding message', response);

      return { id, result: response };
    } catch (error) {
      return { id, error: <Error>error };
    }
  });
