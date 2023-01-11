import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getProvider } from '@wagmi/core';
import { Address, UserRejectedRequestError } from 'wagmi';

import { Messenger } from '~/core/messengers';
import {
  appSessionsStore,
  notificationWindowStore,
  pendingRequestStore,
} from '~/core/state';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getDappHost } from '~/core/utils/connectedApps';
import { toHex } from '~/core/utils/numbers';

export const DEFAULT_ACCOUNT =
  '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4' as Address;
export const DEFAULT_ACCOUNT_2 =
  '0x5B570F0F8E2a29B7bCBbfC000f9C7b78D45b7C35' as Address;
export const DEFAULT_CHAIN_ID = '0x1';

const openWindow = async () => {
  const { setWindow, window: stateWindow } = notificationWindowStore.getState();
  if (stateWindow) return;
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    height: 625,
    width: 360,
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
  const { addPendingRequest, removePendingRequest } =
    pendingRequestStore.getState();
  // Add pending request to global background state.
  addPendingRequest(request);
  openWindow();
  // Wait for response from the popup.
  const payload: unknown | null = await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    messenger.reply(`message:${request.id}`, async (payload) =>
      resolve(payload),
    ),
  );
  removePendingRequest(request.id);
  if (!payload) {
    throw new UserRejectedRequestError('User rejected the request.');
  }
  return payload;
};

/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = ({
  messenger,
}: {
  messenger: Messenger;
}) =>
  providerRequestTransport.reply(async ({ method, id, params }, meta) => {
    console.log(meta.sender, method);

    const { getActiveSession, addSession } = appSessionsStore.getState();
    const host = getDappHost(meta?.sender?.url || '');
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
            response = await messengerProviderRequest(messenger, {
              method,
              id,
              params,
              meta,
            });
          }
          break;
        }
        case 'wallet_addEthereumChain':
        case 'wallet_switchEthereumChain':
        case 'eth_requestAccounts': {
          if (activeSession) {
            response = [activeSession.address];
            break;
          }
          const { address, chainId } = (await messengerProviderRequest(
            messenger,
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
          });
          response = [address];
          break;
        }
        case 'eth_blockNumber': {
          const provider = getProvider({ chainId: activeSession?.chainId });
          const blockNumber = await provider.getBlockNumber();
          response = blockNumber;
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
