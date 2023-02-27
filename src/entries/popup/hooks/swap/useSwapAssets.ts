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
import { useDebounce } from '../useDebounce';
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

  const debouncedAssetToSwapFilter = useDebounce(assetToSwapFilter, 500);
  const debouncedAssetToReceiveFilter = useDebounce(assetToReceiveFilter, 500);

  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const filteredAssetsToSwap = useMemo(() => {
    return debouncedAssetToSwapFilter
      ? userAssets?.filter(
          ({ name, symbol, address }) =>
            name
              .toLowerCase()
              .startsWith(debouncedAssetToSwapFilter.toLowerCase()) ||
            symbol
              .toLowerCase()
              .startsWith(debouncedAssetToSwapFilter.toLowerCase()) ||
            address
              .toLowerCase()
              .startsWith(debouncedAssetToSwapFilter.toLowerCase()),
        )
      : userAssets;
  }, [userAssets, debouncedAssetToSwapFilter]);

  const assetToSwap = useMemo(
    () =>
      userAssets?.find(({ address }) =>
        isLowerCaseMatch(address, assetToSwapAddress),
      ),
    [userAssets, assetToSwapAddress],
  );

  const { results: searchReceiveAssetResults } = useSearchCurrencyLists({
    inputChainId: assetToSwap?.chainId,
    outputChainId,
    searchQuery: debouncedAssetToReceiveFilter,
  });

  const searchReceiveAssetAddresses = useMemo(
    () =>
      searchReceiveAssetResults
        ?.map(({ data }) => data)
        .flat()
        ?.map((asset) => asset?.uniqueId || '')
        ?.filter((address) => !!address),
    [searchReceiveAssetResults],
  );

  const { data: rawAssetsToReceive } = useAssets({
    assetAddresses: searchReceiveAssetAddresses,
    currency: currentCurrency,
  });

  const assetsToReceive: ParsedAddressAsset[] = useMemo(
    () =>
      Object.values(rawAssetsToReceive || {}).map((asset) => {
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
    [rawAssetsToReceive, outputChainId, userAssets],
  );

  const assetsToReceivee = useMemo(() => {
    return searchReceiveAssetResults.map(({ data, title }) => {
      const parsedData: ParsedAddressAsset[] =
        data
          ?.map((asset) =>
            assetsToReceive.find((parsedAsset) =>
              isLowerCaseMatch(parsedAsset.address, asset?.uniqueId),
            ),
          )
          ?.filter((p): p is ParsedAddressAsset => !!p) || [];
      return { data: parsedData, title };
    });
  }, [assetsToReceive, searchReceiveAssetResults]);

  const assetToReceive = useMemo(
    () =>
      assetsToReceive?.find(
        ({ address, chainId }) =>
          isLowerCaseMatch(address, assetToReceiveAddress) &&
          chainId === outputChainId,
      ),
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
    assetsToReceive: assetsToReceivee,
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
