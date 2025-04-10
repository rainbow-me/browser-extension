import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
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

  const allSupportedChains = networkStore((state) => state.getAllChains(true));
  const mainnetSupportedChains = Object.values(allSupportedChains).filter(
    (chain) => !chain.testnet,
  );
  const chainIdsByMainnetId = networkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );

  const availableChains = useMemo(() => {
    const disabledChains = Object.values(mainnetSupportedChains).filter(
      (chain) => !enabledChainIds.has(chain.id),
    );
    const allDisabledChains = disabledChains
      .filter(
        (chain) =>
          chain.id !== ChainId.hardhat && chain.id !== ChainId.hardhatOptimism,
      )
      .map((chain) => {
        if (chainIdsByMainnetId[chain.id]) {
          return [...chainIdsByMainnetId[chain.id], chain.id];
        }
        return [chain.id];
      })
      .flat();

    const chains = Object.values(allSupportedChains).filter((chain) => {
      const isTestingChain = checkIfTesting(chain.id, testnetMode);
      const isNotDisabled = !allDisabledChains.includes(chain.id);
      const matchesTestnetMode = testnetMode
        ? !!chain.testnet
        : !chain.testnet ||
          (IS_TESTING &&
            (chain.id === ChainId.hardhat ||
              chain.id === ChainId.hardhatOptimism));

      return (isTestingChain || isNotDisabled) && matchesTestnetMode;
    });

    return sortNetworks(chainOrder, chains);
  }, [
    testnetMode,
    enabledChainIds,
    chainOrder,
    chainIdsByMainnetId,
    allSupportedChains,
    mainnetSupportedChains,
  ]);

  return { chains: availableChains };
};
