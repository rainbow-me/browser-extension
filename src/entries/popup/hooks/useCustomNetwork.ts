import { useCustomRPCsStore } from '~/core/state/customRPC';

export const useCustomNetwork = () => {
  const { customChains } = useCustomRPCsStore();
  const chains = Object.values(customChains)
    .map((customChain) =>
      customChain.chains.find(
        (chain) => chain.rpcUrls.default.http[0] === customChain.activeRpcUrl,
      ),
    )
    .filter(Boolean);
  return {
    customChains: chains,
  };
};
