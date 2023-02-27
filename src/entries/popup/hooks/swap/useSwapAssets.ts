import { useEffect, useMemo, useState } from 'react';
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
import usePrevious from '../usePrevious';
import { useSearchCurrencyLists } from '../useSearchCurrencyLists';

const sortBy = (by: SortMethod) => {
  switch (by) {
    case 'token':
      return selectUserAssetsList;
    case 'chain':
      return selectUserAssetsListByChainId;
  }
};

const parseParsedAssetToParsedAddressAsset = ({
  parsedAsset,
  outputChainId,
  parsedAddressAsset,
}: {
  parsedAsset: ParsedAsset;
  outputChainId: ChainId;
  parsedAddressAsset?: ParsedAddressAsset;
}) => ({
  ...parsedAsset,
  address: parsedAddressAsset?.address || parsedAsset.address,
  chainId: outputChainId,
  native: {
    balance: {
      amount: '0',
      display: '0.00',
    },
    price: parsedAsset.native.price,
  },
  balance: parsedAddressAsset?.balance || { amount: '0', display: '0.00' },
  icon_url: parsedAddressAsset?.icon_url || parsedAsset?.icon_url,
  colors: parsedAddressAsset?.colors || parsedAsset?.colors,
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
  const prevOutputChainId = usePrevious(outputChainId);

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [assetToSwapFilter, setAssetToSwapFilter] = useState('');
  const [assetToReceiveFilter, setAssetToReceiveFilter] = useState('');

  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const filteredAssetsToSwap = useMemo(() => {
    return assetToSwapFilter
      ? userAssets?.filter(
          ({ name, symbol, address }) =>
            name.toLowerCase().startsWith(assetToSwapFilter.toLowerCase()) ||
            symbol.toLowerCase().startsWith(assetToSwapFilter.toLowerCase()) ||
            address.toLowerCase().startsWith(assetToSwapFilter.toLowerCase()),
        )
      : userAssets;
  }, [userAssets, assetToSwapFilter]);

  const assetToSwap = useMemo(
    () =>
      userAssets?.find(({ address }) =>
        isLowerCaseMatch(address, assetToSwapAddress),
      ) || null,
    [userAssets, assetToSwapAddress],
  );

  const { results } = useSearchCurrencyLists({
    inputChainId: assetToSwap?.chainId || undefined,
    outputChainId,
    searchQuery: assetToReceiveFilter,
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
            userAsset.chainId === outputChainId,
        );
        return parseParsedAssetToParsedAddressAsset({
          parsedAsset: asset,
          parsedAddressAsset,
          outputChainId,
        });
      }),
    [assets, outputChainId, userAssets],
  );

  const filteredAssetsToReceive = useMemo(() => {
    return assetToReceiveFilter
      ? assetsToReceive?.filter(
          ({ name, symbol, address }) =>
            name.toLowerCase().startsWith(assetToReceiveFilter.toLowerCase()) ||
            symbol
              .toLowerCase()
              .startsWith(assetToReceiveFilter.toLowerCase()) ||
            address
              .toLowerCase()
              .startsWith(assetToReceiveFilter.toLowerCase()),
        )
      : assetsToReceive;
  }, [assetToReceiveFilter, assetsToReceive]);

  const assetToReceive = useMemo(
    () =>
      assetsToReceive?.find(
        ({ address, chainId }) =>
          isLowerCaseMatch(address, assetToReceiveAddress) &&
          chainId === outputChainId,
      ) || null,
    [assetsToReceive, assetToReceiveAddress, outputChainId],
  );

  useEffect(() => {
    if (prevOutputChainId !== outputChainId) {
      setAssetToReceiveAddress('');
    }
  }, [outputChainId, prevOutputChainId]);

  return {
    assetsToSwap: filteredAssetsToSwap,
    assetToSwapFilter,
    assetsToReceive: filteredAssetsToReceive,
    assetToReceiveFilter,
    sortMethod,
    assetToSwap,
    assetToReceive,
    outputChainId,
    setSortMethod,
    setAssetToSwapAddress,
    setAssetToReceiveAddress,
    setOutputChainId,
    setAssetToSwapFilter,
    setAssetToReceiveFilter,
  };
};
