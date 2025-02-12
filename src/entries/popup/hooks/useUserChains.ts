import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const useUserChains = () => {
  const { enabledChainIds, chainOrder } = networkStore.getState();
  const { testnetMode } = useTestnetModeStore();
  const supportedChains = networkStore((state) =>
    state.getAllChainsSortedByOrder(testnetMode),
  );
  const chainIdsBasedOnMainnetId = networkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );

  const chains = useMemo(() => {
    const allAvailableUserChains = Array.from(enabledChainIds)
      .map((chainId) => chainIdsBasedOnMainnetId[chainId] || [chainId])
      .flat();

    const checkIfTesting = (chainId: ChainId) => {
      if (IS_TESTING) {
        return testnetMode
          ? chainId === ChainId.hardhatOptimism
          : chainId === ChainId.hardhat;
      }
      return false;
    };

    const chains = supportedChains.filter(
      ({ id }) => !allAvailableUserChains.includes(id) || checkIfTesting(id),
    );

    return sortNetworks(chainOrder, chains);
  }, [
    enabledChainIds,
    chainIdsBasedOnMainnetId,
    chainOrder,
    testnetMode,
    supportedChains,
  ]);

  return { chains };
};
