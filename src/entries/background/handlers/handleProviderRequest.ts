import { UserRejectedRequestError } from 'wagmi';
import { extensionMessenger } from '~/core/messengers';
import { backgroundStore } from '~/core/state';
import { Storage } from '~/core/storage';
import { providerRequestTransport } from '~/core/transports';

export const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
export const DEFAULT_CHAIN_ID = '0x1';

const openWindow = async () => {
  const window = await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    height: 600,
    width: 360,
  });
  backgroundStore.getState().setCurrentWindow(window);
};

const isApprovedHost = async (host: string) => {
  const approvedHosts = await Storage.get('approvedHosts');
  return approvedHosts.includes(host);
};
/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = () =>
  providerRequestTransport.reply(async ({ method, id, params }, meta) => {
    console.log(meta.sender, method);

    const { addApprovedHost, currentAddress, addPendingRequest } =
      backgroundStore.getState();

    try {
      let response = null;

      switch (method) {
        case 'eth_chainId':
          response = DEFAULT_CHAIN_ID;
          break;
        case 'eth_accounts': {
          const approvedHost = await isApprovedHost(meta.sender.origin || '');
          response = approvedHost ? [currentAddress] : [];
          break;
        }
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
        case 'eth_sign':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
          addPendingRequest({
            method,
            id,
            params,
          });
          openWindow();
          // Wait for response from the popup.
          await new Promise((resolve, reject) =>
            // eslint-disable-next-line no-promise-executor-return
            extensionMessenger.reply(`message:${id}`, async (payload) =>
              payload
                ? resolve(payload)
                : reject(
                    new UserRejectedRequestError('User rejected the request.'),
                  ),
            ),
          );
          break;
        case 'wallet_addEthereumChain':
        case 'wallet_switchEthereumChain':
        case 'eth_requestAccounts': {
          const approvedHost = await isApprovedHost(meta.sender.origin || '');
          if (approvedHost) {
            response = [currentAddress];
            break;
          }
          // Add pending request to global background state.
          addPendingRequest({
            method,
            id,
            params,
          });
          openWindow();
          // Wait for response from the popup.
          await new Promise((resolve, reject) =>
            // eslint-disable-next-line no-promise-executor-return
            extensionMessenger.reply(`message:${id}`, async (payload) =>
              payload
                ? resolve(payload)
                : reject(
                    new UserRejectedRequestError('User rejected the request.'),
                  ),
            ),
          );

          if (!approvedHost && meta.sender.origin) {
            addApprovedHost(meta.sender.origin);
          }
          response = [currentAddress];
          break;
        }

        default: {
          // TODO: handle other methods
        }
      }

      return { id, result: response };
    } catch (error) {
      return { id, error: <Error>error };
    }
  });
