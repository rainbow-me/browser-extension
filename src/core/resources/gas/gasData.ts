import { ChainId } from '~/core/types/chains';

import { useMeteorology } from './meteorology';
import { useProviderGas } from './providerGas';

export const useGasData = ({ chainId }: { chainId: ChainId }) => {
  const meteorologySupportsChain = [
    ChainId.bsc,
    ChainId.mainnet,
    ChainId.polygon,
  ].includes(chainId);

  const { data: meteorologyData, isLoading: meteorologyDataIsLoading } =
    useMeteorology(
      { chainId },
      {
        refetchInterval: 5000,
        enabled: meteorologySupportsChain,
      },
    );

  const { data: providerGasData, isLoading: providerGasDataIsLoading } =
    useProviderGas(
      { chainId, transactionRequest },
      {
        enabled: !meteorologySupportsChain,
        refetchInterval: 5000,
      },
    );

  return {
    data: meteorologySupportsChain ? meteorologyData : providerGasData,
    isLoading: meteorologySupportsChain
      ? meteorologyDataIsLoading
      : providerGasDataIsLoading,
  };
};
