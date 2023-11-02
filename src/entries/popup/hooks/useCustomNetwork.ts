import { useCustomRPCsStore } from '~/core/state/customRPC';

export const useCustomNetwork = () => {
  const { customChains } = useCustomRPCsStore();
  const chains = Object.values(customChains)
    .map((customChain) =>
      customChain.rpcs.find((rpc) => rpc.rpcUrl === customChain.activeRpcUrl),
    )
    .filter(Boolean);
  return {
    customChains: chains,
  };
};
