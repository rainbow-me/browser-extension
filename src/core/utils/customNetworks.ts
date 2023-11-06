import { customRPCsStore } from '../state/customRPC';

export const getCustomNetworks = () => {
  const { customChains } = customRPCsStore.getState();
  const chains = Object.values(customChains)
    .map((customChain) =>
      customChain.chains.find(
        (chain) => chain.rpcUrls.default.http[0] === customChain.activeRpcUrl,
      ),
    )
    .filter(Boolean);
  return chains;
};

export const findCustomNetworkForChainId = (chainId: number) => {
  const customNetworks = getCustomNetworks();
  return customNetworks.find((network) => network.id === chainId);
};

export const isCustomNetwork = (chainId: number) =>
  !!findCustomNetworkForChainId(chainId);
