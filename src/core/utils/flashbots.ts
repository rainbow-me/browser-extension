import { Provider, StaticJsonRpcProvider } from '@ethersproject/providers';

import { proxyRpcEndpoint } from '../providers/proxy';
import { ChainId } from '../types/chains';

export const getFlashbotsProvider = () => {
  return new StaticJsonRpcProvider(
    proxyRpcEndpoint(
      'https://rpc.flashbots.net/?hint=hash&builder=flashbots&builder=f1b.io&builder=rsync&builder=beaverbuild.org&builder=builder0x69&builder=titan&builder=eigenphi&builder=boba-builder',
      ChainId.mainnet,
    ),
    'mainnet',
  ) as Provider;
};
