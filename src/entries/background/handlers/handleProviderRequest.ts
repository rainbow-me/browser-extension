import { providerRequestTransport } from '~/core/transports';

const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
const DEFAULT_CHAIN_ID = '0x1';

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
        case 'eth_requestAccounts':
          response = [DEFAULT_ACCOUNT];
          break;
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
