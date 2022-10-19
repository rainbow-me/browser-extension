import {
  coreProviderTransport,
  providerRequestTransport,
} from '~/core/transports';

export const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
export const DEFAULT_CHAIN_ID = '0x1';
import { backgroundStore } from '../storage/sessions';

/**
 * Handles RPC requests from the provider.
 */
export const handleProviderRequest = () =>
  providerRequestTransport.reply(async ({ method, id }, meta) => {
    console.log(meta.sender, method);
    try {
      let response = null;
      switch (method) {
        case 'eth_chainId':
          response = DEFAULT_CHAIN_ID;
          break;
        case 'eth_requestAccounts': {
          console.log('extensionMessenger reply send eth_requestAccounts');
          const eeee = await coreProviderTransport.send({
            method,
            id,
          });
          const account = backgroundStore.getState().currentAccount;
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
