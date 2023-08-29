import { Provider, StaticJsonRpcProvider } from '@ethersproject/providers';

export const getFlashbotsProvider = () => {
  return new StaticJsonRpcProvider(
    'https://rpc.flashbots.net/?hint=hash&builder=flashbots&builder=f1b.io&builder=rsync&builder=beaverbuild.org&builder=builder0x69&builder=titan&builder=eigenphi&builder=boba-builder',
    'mainnet',
  ) as Provider;
};
