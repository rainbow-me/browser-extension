import { rpcHub } from '~/core/rpc-hub';
import { bridgeMessenger, extensionMessenger } from '~/core/messengers';
import { coreProviderTransport } from '../transports';

export const setupRPCHub = () => {
  coreProviderTransport.reply(async ({ method, id }, meta) => {
    console.log('---', meta.sender, method);
    try {
      const response = null;
      switch (method) {
        default: {
          rpcHub.addUnapprovedMessage(method);

          // TODO: handle other methods
        }
      }
      console.log('responding message', response);

      return { id, result: response };
    } catch (error) {
      return { id, error: <Error>error };
    }
  });
  // coreProviderTransport.reply(async (payload, { topic }) => {
  //   console.log('setupRPCHub', topic);
  //   switch (topic) {
  //     case 'eth_requestAccounts_rpc':
  //       console.log('extension messenger reply', payload, topic);
  //       console.log('extension messenger topic', topic);
  //       if (!topic) return;

  //       console.log('extension messenger reply response');
  //       return true;
  //     default:
  //       return true;
  //   }
  // });

  // rpcHub.once('unapprovedMessage', (topic: string) => {
  //   console.log('UNAPROOVED MESSAGEEEE', topic);
  // });
};
