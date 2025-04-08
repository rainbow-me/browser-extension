import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
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
  const { enabledChainIds, chainOrder } = useNetworkStore((state) => ({
    enabledChainIds: state.enabledChainIds,
    chainOrder: state.chainOrder,
  }));
  const { testnetMode } = useTestnetModeStore();

  const allSupportedChains = useNetworkStore((state) =>
    state.getAllChains(true),
  );
  const chainIdsByMainnetId = useNetworkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );

  const availableChains = useMemo(() => {
    const disabledChains = Object.values(allSupportedChains).filter(
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

    const chains = Object.values(allSupportedChains).filter(
      (chain) =>
        (checkIfTesting(chain.id, testnetMode) ||
          !allDisabledChains.includes(chain.id)) &&
        (testnetMode
          ? !!chain.testnet
          : !chain.testnet ||
            (IS_TESTING &&
              (chain.id === ChainId.hardhat ||
                chain.id === ChainId.hardhatOptimism))),
    );

    return sortNetworks(chainOrder, chains);
  }, [
    testnetMode,
    enabledChainIds,
    chainOrder,
    chainIdsByMainnetId,
    allSupportedChains,
  ]);

  return { chains: availableChains };
};
