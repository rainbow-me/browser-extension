import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

import {
  selectUserAssetsList,
  selectUserAssetsListByChainId,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';

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

  const [index, setIndex] = useState<number>(-1);
  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency: currentCurrency,
    },
    { select: sortBy(sortMethod) },
  );

  const selectAssetIndex = useCallback(
    (n?: number) => {
      setIndex(n ?? index + 1);
    },
    [index],
  );

  const asset = index === -1 ? null : assets?.[index];

  return {
    selectAssetIndex,
    asset,
    assets,
    sortMethod,
    setSortMethod,
  };
};
