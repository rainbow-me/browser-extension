import { useMemo } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { isCustomChain } from '~/core/utils/chains';
import { sortNetworks } from '~/core/utils/userChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const isHardhatChain = (chainId: ChainId) =>
  chainId === ChainId.hardhat || chainId === ChainId.hardhatOptimism;

export const useUserChains = () => {
  const { enabledChainIds, chainOrder } = useNetworkStore((state) => ({
    enabledChainIds: state.enabledChainIds,
    chainOrder: state.chainOrder,
  }));

  const { testnetMode } = useTestnetModeStore();

  const allTransformedChainsMap = useNetworkStore((state) =>
    state.getAllChains(true),
  );
  const allTransformedChains = useMemo(
    () => Object.values(allTransformedChainsMap),
    [allTransformedChainsMap],
  );

  const chainIdsByMainnetId = useNetworkStore((state) =>
    state.getBackendChainIdsByMainnetId(),
  );

  const availableChains = useMemo(() => {
    const disabledStandardTestnetIds = new Set<number>();
    for (const mainnetIdStr in chainIdsByMainnetId) {
      const mainnetId = parseInt(mainnetIdStr, 10);
      if (!enabledChainIds.has(mainnetId)) {
        chainIdsByMainnetId[mainnetId]?.forEach((testnetId) => {
          disabledStandardTestnetIds.add(testnetId);
        });
      }
    }

    const enabledFilteredChains = allTransformedChains.filter((chain) => {
      let matchesMode = false;
      if (isHardhatChain(chain.id)) {
        if (!IS_TESTING) return false;
        matchesMode = testnetMode
          ? chain.id === ChainId.hardhatOptimism
          : chain.id === ChainId.hardhat;
      } else {
        matchesMode = testnetMode ? !!chain.testnet : !chain.testnet;
      }

      if (!matchesMode) {
        return false;
      }

      if (isHardhatChain(chain.id)) {
        return true;
      }

      const isChainCustom = isCustomChain(chain.id);
      if (isChainCustom || !chain.testnet) {
        return enabledChainIds.has(chain.id);
      } else {
        const isDisabled = disabledStandardTestnetIds.has(chain.id);
        return !isDisabled;
      }
    });

    return sortNetworks(chainOrder, enabledFilteredChains);
  }, [
    testnetMode,
    enabledChainIds,
    chainOrder,
    chainIdsByMainnetId,
    allTransformedChains,
  ]);

  return { chains: availableChains };
};
