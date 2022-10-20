import { bridgeMessenger, extensionMessenger } from '~/core/messengers';
import { backgroundStore } from '~/core/state';
import {
  coreProviderTransport,
  providerRequestTransport,
} from '~/core/transports';

export const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
export const DEFAULT_CHAIN_ID = '0x1';

/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = () =>
  providerRequestTransport.reply(async ({ method, id, params }, meta) => {
    console.log('-----', meta.sender, method);
    console.log('-- send', 'topic123');
    try {
      let response = null;
      switch (method) {
        case 'eth_chainId':
          response = DEFAULT_CHAIN_ID;
          break;
        case 'eth_accounts':
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
        case 'eth_sign':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
        case 'wallet_addEthereumChain':
        case 'wallet_switchEthereumChain':
        case 'eth_requestAccounts': {
          backgroundStore.getState().addPendingRequest({
            method,
            id,
            params,
          });
          console.log('-- send', `message:${id}`);

          const requestResponse = await extensionMessenger.send(
            `message:${id}`,
            {
              method,
              id,
              params,
            },
          );
          console.log('-- requestResponse', requestResponse);

          // if (requestResponse?.error) throw requestResponse.error;
          const account = backgroundStore.getState().currentAddress;
          response = [account];
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
