import { UserRejectedRequestError } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { approvedHostsStore, notificationWindowStore } from '~/core/state';
import { pendingRequestStore } from '~/core/state/pendingRequest';
import { providerRequestTransport } from '~/core/transports';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

const popupMessenger = initializeMessenger({ connect: 'popup' });

export const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
export const DEFAULT_CHAIN_ID = '0x1';

const openWindow = async () => {
  const { setWindow } = notificationWindowStore.getState();
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    height: 600,
    width: 360,
  });
  setWindow(window);
};

/**
 * Uses extensionMessenger to send messages to popup for the user to approve or reject
 * @param {PendingRequest} request
 * @returns {boolean}
 */
const extensionMessengerRequestApproval = async (
  request: ProviderRequestPayload,
) => {
  const { addPendingRequest, removePendingRequest } =
    pendingRequestStore.getState();
  // Add pending request to global background state.
  addPendingRequest(request);
  openWindow();
  // Wait for response from the popup.
  const approved = await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    popupMessenger.reply(`message:${request.id}`, async (payload) =>
      resolve(payload),
    ),
  );
  removePendingRequest(request.id);
  if (!approved) {
    throw new UserRejectedRequestError('User rejected the request.');
  }
  return approved;
};

/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = () =>
  providerRequestTransport.reply(async ({ method, id, params }, meta) => {
    console.log(meta.sender, method);

    const { addApprovedHost, isApprovedHost } = approvedHostsStore.getState();

    try {
      let response = null;

      switch (method) {
        case 'eth_chainId':
          response = DEFAULT_CHAIN_ID;
          break;
        case 'eth_accounts': {
          const approvedHost = await isApprovedHost(meta.sender.origin);
          response = approvedHost ? [DEFAULT_ACCOUNT] : [];
          break;
        }
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
        case 'eth_sign':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4': {
          await extensionMessengerRequestApproval({
            method,
            id,
            params,
          });
          break;
        }
        case 'wallet_addEthereumChain':
        case 'wallet_switchEthereumChain':
        case 'eth_requestAccounts': {
          const approvedHost = await isApprovedHost(meta.sender.origin);
          if (approvedHost) {
            response = [DEFAULT_ACCOUNT];
            break;
          }
          await extensionMessengerRequestApproval({
            method,
            id,
            params,
          });
          if (meta.sender.origin) {
            addApprovedHost(meta.sender.origin);
          }
          response = [DEFAULT_ACCOUNT];
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
