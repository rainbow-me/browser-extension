import { useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { SortMethod } from '../send/useSendTransactionAsset';

const sortBy = (by: SortMethod) => {
  switch (by) {
    case 'token':
      return selectUserAssetsList;
    case 'chain':
      return selectUserAssetsListByChainId;
  }
};

export const useSwapAssets = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const [assetToSwapAddress, setAssetToSwapAddress] = useState<Address | ''>(
    '',
  );
  const [assetToReceiveAddress, setAssetToReceiveAddress] = useState<
    Address | ''
  >('');

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const { data: assets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const assetToSwap = useMemo(
    () =>
      assets?.find(({ address }) =>
        isLowerCaseMatch(address, assetToSwapAddress),
      ) || null,
    [assets, assetToSwapAddress],
  );

  const assetToReceive = useMemo(
    () =>
      assets?.find(({ address }) =>
        isLowerCaseMatch(address, assetToReceiveAddress),
      ) || null,
    [assets, assetToReceiveAddress],
  );

  return {
    assets,
    sortMethod,
    assetToSwap,
    assetToReceive,
    setSortMethod,
    setAssetToSwapAddress,
    setAssetToReceiveAddress,
  };
};
