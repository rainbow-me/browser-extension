import { useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { SortMethod } from '../send/useSendTransactionAsset';
import { useSearchCurrencyLists } from '../useSearchCurrencyLists';

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

  const { results } = useSearchCurrencyLists({
    // inputChainId: ChainId.mainnet,
    outputChainId: ChainId.mainnet,
  });

  const addresses = results
    ?.map(({ data }) => data)
    .flat()
    ?.map((asset) => asset?.uniqueId || '')
    ?.filter((address) => !!address);

  const { data: assets } = useAssets({
    assetAddresses: addresses,
    currency: currentCurrency,
  });
  const assetsToReceive: ParsedAsset[] = Object.values(assets || {}).map(
    (asset) => ({
      ...asset,
      chainId: ChainId.mainnet,
    }),
  );

  const { data: assetsToSwap = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const assetToSwap = useMemo(
    () =>
      assetsToSwap?.find(({ address }) =>
        isLowerCaseMatch(address, assetToSwapAddress),
      ) || null,
    [assetsToSwap, assetToSwapAddress],
  );

  const assetToReceive = useMemo(
    () =>
      assetsToSwap?.find(({ address }) =>
        isLowerCaseMatch(address, assetToReceiveAddress),
      ) || null,
    [assetsToSwap, assetToReceiveAddress],
  );

  return {
    assetsToSwap,
    assetsToReceive,
    sortMethod,
    assetToSwap,
    assetToReceive,
    setSortMethod,
    setAssetToSwapAddress,
    setAssetToReceiveAddress,
  };
};
