import { ChainId } from '~/core/types/chains';
import { meteorologySupportsChain } from '~/core/utils/gas';

import { useMeteorology } from './meteorology';
import { useProviderGas } from './providerGas';

export const useGasData = ({ chainId }: { chainId: ChainId }) => {
  const meteorologySupportsChainId = meteorologySupportsChain(chainId);
  const { data: meteorologyData, isLoading: meteorologyDataIsLoading } =
    useMeteorology(
      { chainId },
      {
        refetchInterval: 5000,
        enabled: meteorologySupportsChainId,
      },
    );

  const { data: providerGasData, isLoading: providerGasDataIsLoading } =
    useProviderGas(
      { chainId },
      {
        enabled: !meteorologySupportsChainId,
        refetchInterval: 5000,
      },
    );

  return {
    data: meteorologySupportsChainId ? meteorologyData : providerGasData,
    isLoading: meteorologySupportsChainId
      ? meteorologyDataIsLoading
      : providerGasDataIsLoading,
  };
};
