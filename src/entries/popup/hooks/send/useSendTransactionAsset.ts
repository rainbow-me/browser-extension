import { useCallback, useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import {
  selectUserAssetsList,
  selectUserAssetsListByChainId,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
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

export const useSendTransactionAsset = () => {
  const { address } = useAccount();
  const { currentCurrency } = useCurrentCurrencyStore();
  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [selectedAssetAddress, setSelectedAssetAddress] = useState<
    Address | ''
  >('');
  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency: currentCurrency,
    },
    { select: sortBy(sortMethod) },
  );

  const selectAssetAddress = useCallback((address: Address | '') => {
    setSelectedAssetAddress(address);
  }, []);

  const asset = useMemo(
    () =>
      assets?.find(({ address }) =>
        isLowerCaseMatch(address, selectedAssetAddress),
      ) || null,
    [assets, selectedAssetAddress],
  );

  return {
    selectAssetAddress,
    asset,
    assets,
    sortMethod,
    setSortMethod,
  };
};
