import { rpcHub } from '~/core/rpc-hub';
import { coreProviderTransport } from '../transports';

export const setupRPCHub = () => {
  coreProviderTransport.reply(async ({ method, id, params }, meta) => {
    console.log('---', meta.sender, method, params);
    try {
      const response = await rpcHub.waitUnapprovedMesagges(method);
      return { id, result: response };
    } catch (error) {
      return { id, error: <Error>error };
    }
  });
};
