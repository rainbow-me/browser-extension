import { Provider, StaticJsonRpcProvider } from '@ethersproject/providers';

export const getFlashbotsProvider = () => {
  return new StaticJsonRpcProvider(
    'https://rpc.flashbots.net',
    'mainnet',
  ) as Provider;
};
