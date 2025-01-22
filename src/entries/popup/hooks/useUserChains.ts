import { useMemo } from 'react';

import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { chainIdMap, sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const useUserChains = () => {
  const { userChainsOrder, userChains } = useUserChainsStore();
  const { testnetMode } = useTestnetModeStore();
  const supportedChains = useBackendNetworksStore((state) =>
    state.getSupportedChains(),
  );

  const availableChains = useMemo(() => {
    const availableChains = Object.keys(userChains)
      .filter((chainId) => userChains[Number(chainId)] === true)
      .map((chainId) => Number(chainId));

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
      ({ id }) => allAvailableUserChains.includes(id) || checkIfTesting(id),
    );

    return sortNetworks(userChainsOrder, chains);
  }, [testnetMode, userChains, userChainsOrder, supportedChains]);

  return { chains: availableChains };
};
