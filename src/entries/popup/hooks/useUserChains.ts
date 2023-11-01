import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  getSupportedChainsWithHardhat,
  getSupportedTestnetChains,
} from '~/core/utils/chains';
import { chainIdMap, sortNetworks } from '~/core/utils/userChains';

export const useUserChains = () => {
  const { userChainsOrder, userChains } = useUserChainsStore();
  const { testnetMode } = useTestnetModeStore();

  const availableChains = useMemo(() => {
    const supportedChains = testnetMode
      ? getSupportedTestnetChains()
      : getSupportedChainsWithHardhat();

    const availableChains = Object.keys(userChains)
      .filter((chainId) => userChains[Number(chainId)] === true)
      .map((chainId) => Number(chainId));

    const allAvailableUserChains = availableChains
      .map((chainId) => chainIdMap[chainId])
      .flat();

    const chains = supportedChains.filter((chain) =>
      allAvailableUserChains.includes(chain.id),
    );

    return sortNetworks(userChainsOrder, chains);
  }, [testnetMode, userChains, userChainsOrder]);

  return { chains: availableChains };
};
