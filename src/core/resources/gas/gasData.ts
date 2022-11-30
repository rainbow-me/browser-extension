import { Chain, chain } from 'wagmi';

import { bsc } from '~/core/types/chains';

import { useMeteorology } from './meteorology';
import { useProviderGas } from './providerGas';

export const useGasData = ({ chainId }: { chainId: Chain['id'] }) => {
  const meteorologySupportsChain =
    chainId === chain.mainnet.id ||
    chainId === chain.polygon.id ||
    chainId === bsc.id;

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
      { chainId },
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
