import { useMemo } from 'react';
import { Chain } from 'wagmi';

import { useCurrentAddressStore, useRainbowChainsStore } from '~/core/state';

import { RPCSearchItem, SearchItemType } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

export const useSearchableRPCs = () => {
  const { currentAddress: address } = useCurrentAddressStore();

  const { rainbowChains } = useRainbowChainsStore();

  const disabledRPCs = useMemo(() => {
    const chainIds: number[] = Object.keys(rainbowChains).map(Number);
    return chainIds.reduce((acc: Chain[], chainId) => {
      const rainbowChain = rainbowChains[chainId];
      const filteredRPCs = rainbowChain.chains.find(
        (chain) => chain.rpcUrls.default.http[0] !== rainbowChain.activeRpcUrl,
      );
      return acc.concat(filteredRPCs ?? []);
    }, []);
  }, [rainbowChains]);

  // need to add disabled item for active custom RPC
  // need to add main RPC if not active to the list

  const searchableRPCs = useMemo(() => {
    return disabledRPCs.map<RPCSearchItem>((rpc) => ({
      action: undefined,
      actionLabel: actionLabels.open,
      actionPage: PAGES.NFT_TOKEN_DETAIL,
      id: rpc.name,
      name: `Enable ${rpc.name} RPC`,
      searchTags: [rpc.name],
      page: PAGES.CUSTOM_RPCS,
      selectedWalletAddress: address,
      type: SearchItemType.RPC,
      chainId: rpc.id,
    }));
  }, [address, disabledRPCs]);

  return { searchableRPCs };
};
