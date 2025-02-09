import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { chainIdMap, sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const useUserChains = () => {
  const { enabledChainIds, chainOrder } = networkStore.getState();
  const { testnetMode } = useTestnetModeStore();

  const availableChains = useMemo(() => {
    const supportedChains = getSupportedChains({
      testnets: testnetMode,
    });

    const availableChains = Array.from(enabledChainIds).map((chainId) =>
      Number(chainId),
    );

    const allAvailableUserChains = availableChains
      .map((chainId) => chainIdMap[chainId] || [chainId])
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
      (chain) =>
        allAvailableUserChains.includes(chain.id) || checkIfTesting(chain.id),
    );

    return sortNetworks(chainOrder, chains);
  }, [testnetMode, enabledChainIds, chainOrder]);

  return { chains: availableChains };
};
