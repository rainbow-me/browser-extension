import { useCallback, useMemo, useState } from 'react';

import {
  selectUserAssetsList,
  selectUserAssetsListByChainId,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
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
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [selectedAssetAddress, setSelectedAssetAddress] = useState<
    AddressOrEth | ''
  >('');
  const [selectedAssetChain, setSelectedAssetChain] = useState<ChainId>(
    ChainId.mainnet,
  );
  const { data: assets = [] } = useUserAssets(
    {
      address,
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

  const asset = useMemo(
    () =>
      assets?.find(
        ({ address, chainId }) =>
          isLowerCaseMatch(address, selectedAssetAddress) &&
          chainId === selectedAssetChain,
      ) || null,
    [assets, selectedAssetAddress, selectedAssetChain],
  );

  return {
    selectAssetAddressAndChain,
    asset,
    assets,
    sortMethod,
    setSortMethod,
  };
};
