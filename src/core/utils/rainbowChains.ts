import { rainbowChainsStore } from '../state';

export const findRainbowChainForChainId = (chainId: number) => {
  const { rainbowChains } = getRainbowChains();
  return rainbowChains.find((chain) => chain.id === chainId);
};

export const getRainbowChains = () => {
  const { rainbowChains } = rainbowChainsStore.getState();
  return {
    rainbowChains: Object.values(rainbowChains)
      .map((rainbowChain) =>
        rainbowChain.chains.find(
          (rpc) => rpc.rpcUrls.default.http[0] === rainbowChain.activeRpcUrl,
        ),
      )
      .filter(Boolean),
  };
};
