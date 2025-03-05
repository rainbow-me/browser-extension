import { networkStore } from '~/core/state/networks/networks';
import { getDefaultPollingInterval } from '~/core/state/networks/utils';
import { ChainId } from '~/core/types/chains';

import { useMeteorology } from './meteorology';
import { useProviderGas } from './providerGas';

export const useGasData = ({ chainId }: { chainId: ChainId }) => {
  const meteorologySupportedChainIds = networkStore((state) =>
    state.getMeteorologySupportedChainIds(),
  );
  const meteorologySupportsChainId =
    meteorologySupportedChainIds.includes(chainId);
  const { data: meteorologyData, isLoading: meteorologyDataIsLoading } =
    useMeteorology(
      { chainId },
      {
        refetchInterval: getDefaultPollingInterval(chainId),
        enabled: meteorologySupportsChainId,
      },
    );

  const { data: providerGasData, isLoading: providerGasDataIsLoading } =
    useProviderGas(
      { chainId },
      {
        enabled: !meteorologySupportsChainId,
        refetchInterval: getDefaultPollingInterval(chainId),
      },
    );

  return {
    data: meteorologySupportsChainId ? meteorologyData : providerGasData,
    isLoading: meteorologySupportsChainId
      ? meteorologyDataIsLoading
      : providerGasDataIsLoading,
  };
};
