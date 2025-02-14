import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';
import { sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const checkIfTesting = (chainId: ChainId, testnetMode: boolean) => {
  if (IS_TESTING) {
    return testnetMode
      ? chainId === ChainId.hardhatOptimism
      : chainId === ChainId.hardhat;
  }
  return false;
};

export const useUserChains = () => {
  const { enabledChainIds, chainOrder } = networkStore((state) => ({
    enabledChainIds: state.enabledChainIds,
    chainOrder: state.chainOrder,
  }));
  const { testnetMode } = useTestnetModeStore();

  const chainIdsByMainnetId = networkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );

  const availableChains = useMemo(() => {
    const supportedChains = getSupportedChains({
      testnets: testnetMode,
    });

    const allAvailableUserChains = Array.from(enabledChainIds)
      .map((chainId) => {
        if (chainIdsByMainnetId[chainId]) {
          return [...chainIdsByMainnetId[chainId], chainId];
        }
        return [chainId];
      })
      .flat();

    const chains = supportedChains.filter(
      (chain) =>
        allAvailableUserChains.includes(chain.id) ||
        checkIfTesting(chain.id, testnetMode),
    );

    return sortNetworks(chainOrder, chains);
  }, [testnetMode, enabledChainIds, chainOrder, chainIdsByMainnetId]);

  return { chains: availableChains };
};
