import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { networkStore } from '~/core/state/networks/networks';
import { sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const useUserChains = () => {
  const { userChainsOrder, userChains } = useUserChainsStore();
  const { testnetMode } = useTestnetModeStore();
  const chainIdsBasedOnMainnetId = networkStore.getState().getChainIdsBasedOnMainnetId();

  const availableChains = useMemo(() => {
    const supportedChains = getSupportedChains({
      testnets: testnetMode,
    });

    const availableChains = Object.keys(userChains)
      .filter((chainId) => userChains[Number(chainId)] === true)
      .map((chainId) => Number(chainId));

    const allAvailableUserChains = availableChains
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
      (chain) =>
        allAvailableUserChains.includes(chain.id) || checkIfTesting(chain.id),
    );

    return sortNetworks(userChainsOrder, chains);
  }, [testnetMode, userChains, userChainsOrder]);

  return { chains: availableChains };
};
