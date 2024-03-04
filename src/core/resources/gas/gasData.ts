import { ChainId } from '~/core/types/chains';
import { meteorologySupportsChain } from '~/core/utils/gas';

import { useMeteorology } from './meteorology';
import { useProviderGas } from './providerGas';

const getRefetchTime = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.arbitrum:
    case ChainId.mainnet:
    case ChainId.hardhat:
      return 5000;
    case ChainId.base:
    case ChainId.bsc:
    case ChainId.optimism:
    case ChainId.polygon:
    case ChainId.zora:
    case ChainId.avalanche:
    case ChainId.hardhatOptimism:
    default:
      return 2000;
  }
};

export const useGasData = ({ chainId }: { chainId: ChainId }) => {
  const meteorologySupportsChainId = meteorologySupportsChain(chainId);
  const { data: meteorologyData, isLoading: meteorologyDataIsLoading } =
    useMeteorology(
      { chainId },
      {
        refetchInterval: getRefetchTime(chainId),
        enabled: meteorologySupportsChainId,
      },
    );

  const { data: providerGasData, isLoading: providerGasDataIsLoading } =
    useProviderGas(
      { chainId },
      {
        enabled: !meteorologySupportsChainId,
        refetchInterval: getRefetchTime(chainId),
      },
    );

  return {
    data: meteorologySupportsChainId ? meteorologyData : providerGasData,
    isLoading: meteorologySupportsChainId
      ? meteorologyDataIsLoading
      : providerGasDataIsLoading,
  };
};
