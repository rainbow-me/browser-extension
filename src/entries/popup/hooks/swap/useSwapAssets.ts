import { useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
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

const parseParsedAssetToParsedAddressAsset = (
  parsedAsset: ParsedAsset,
  parsedAddressAsset?: ParsedAddressAsset,
) => ({
  ...parsedAsset,
  address: parsedAddressAsset?.address || parsedAsset.address,
  chainId: ChainId.mainnet,
  native: {
    balance: {
      amount: '0',
      display: '0.00',
    },
    price: parsedAsset.native.price,
  },
  balance: parsedAddressAsset?.balance || { amount: '0', display: '0.00' },
});

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
  const [outputChainId, setOutputChainId] = useState(ChainId.mainnet);

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const { results } = useSearchCurrencyLists({
    // inputChainId: ChainId.mainnet,
    outputChainId,
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

  const assetsToReceive: ParsedAddressAsset[] = useMemo(
    () =>
      Object.values(assets || {}).map((asset) => {
        const parsedAddressAsset = userAssets.find(
          (userAsset) =>
            isLowerCaseMatch(userAsset.address, asset.address) &&
            userAsset.chainId === asset.chainId,
        );
        return parseParsedAssetToParsedAddressAsset(asset, parsedAddressAsset);
      }),
    [assets, userAssets],
  );

  const assetToSwap = useMemo(
    () =>
      userAssets?.find(({ address }) =>
        isLowerCaseMatch(address, assetToSwapAddress),
      ) || null,
    [userAssets, assetToSwapAddress],
  );

  const assetToReceive = useMemo(
    () =>
      assetsToReceive?.find(({ address }) =>
        isLowerCaseMatch(address, assetToReceiveAddress),
      ) || null,
    [assetsToReceive, assetToReceiveAddress],
  );

  return {
    assetsToSwap: userAssets,
    assetsToReceive,
    sortMethod,
    assetToSwap,
    assetToReceive,
    outputChainId,
    setSortMethod,
    setAssetToSwapAddress,
    setAssetToReceiveAddress,
    setOutputChainId,
  };
};
