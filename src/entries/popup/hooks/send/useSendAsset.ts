import { useCallback, useMemo, useState } from 'react';

import {
  selectUserAssetsList,
  selectUserAssetsListByChainId,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

export type SortMethod = 'token' | 'chain';

const sortBy = (by: SortMethod) => {
  switch (by) {
    case 'token':
      return selectUserAssetsList;
    case 'chain':
      return selectUserAssetsListByChainId;
  }
};

export const useSendAsset = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [selectedAssetAddress, setSelectedAssetAddress] = useState<
    AddressOrEth | ''
  >('');
  const [selectedAssetChain, setSelectedAssetChain] = useState<ChainId>(
    ChainId.mainnet,
  );
  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
    },
    {
      select: (data) => {
        console.log('[Send] Raw userAssets data:', data);
        const filtered = selectorFilterByUserChains({
          data,
          selector: sortBy(sortMethod),
        });
        console.log('[Send] Filtered userAssets:', filtered);
        return filtered;
      },
    },
  );

  const { data: customNetworkAssets = [] } = useCustomNetworkAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({ data, selector: sortBy(sortMethod) }),
    },
  );

  const selectAssetAddressAndChain = useCallback(
    (address: AddressOrEth | '', chainId: ChainId) => {
      setSelectedAssetAddress(address);
      setSelectedAssetChain(chainId);
    },
    [],
  );

  const allAssets = useMemo(() => {
    const combined = Array.from(
      new Map(
        [...customNetworkAssets, ...userAssets].map((item) => [
          item.uniqueId,
          item,
        ]),
      ).values(),
    );
    console.log('[Send] Combined assets:', {
      userAssets: userAssets.length,
      customNetworkAssets: customNetworkAssets.length,
      combined: combined.length,
      assets: combined,
    });
    return combined;
  }, [userAssets, customNetworkAssets]);

  const asset = useMemo(
    () =>
      allAssets?.find(
        ({ address, chainId }) =>
          isLowerCaseMatch(address, selectedAssetAddress) &&
          chainId === selectedAssetChain,
      ) || null,
    [allAssets, selectedAssetAddress, selectedAssetChain],
  );

  return {
    selectAssetAddressAndChain,
    asset,
    assets: allAssets,
    sortMethod,
    setSortMethod,
  };
};
