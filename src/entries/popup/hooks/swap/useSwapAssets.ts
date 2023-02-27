import { useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
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
  outputChainId,
  rawAsset,
  userAsset,
  searchAsset,
}: {
  rawAsset: ParsedAsset;
  userAsset?: ParsedAddressAsset;
  outputChainId: ChainId;
  searchAsset?: SearchAsset;
}) => {
  const assetNetworkInformation = searchAsset?.networks[outputChainId];

  // if searchAsset is appearing because it found an exact match
  // "on other networks" we need to take the first network, decimals and address to
  // use for the asset

  const networks = Object.entries(searchAsset?.networks || {});
  const assetInOneNetwork = networks.length === 1;

  const address = assetInOneNetwork
    ? networks[0][1].address
    : assetNetworkInformation?.address ||
      userAsset?.address ||
      rawAsset.address;

  const decimals = assetInOneNetwork
    ? networks[0][1].decimals
    : assetNetworkInformation?.decimals || rawAsset.decimals;
  const chainId = assetInOneNetwork ? Number(networks[0][0]) : outputChainId;

  return {
    ...rawAsset,
    decimals,
    address,
    chainId,
    native: {
      balance: {
        amount: '0',
        display: '0.00',
      },
      price: rawAsset.native.price,
    },
    balance: userAsset?.balance || { amount: '0', display: '0.00' },
    icon_url:
      userAsset?.icon_url || rawAsset?.icon_url || searchAsset?.icon_url,
  };
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

  const { results: searchReceiveAssetsSections } = useSearchCurrencyLists({
    inputChainId: assetToSwap?.chainId,
    outputChainId,
    searchQuery: debouncedAssetToReceiveFilter,
  });

  const searchReceiveAssets = useMemo(
    () =>
      searchReceiveAssetsSections
        ?.map(({ data }) => data)
        .flat()
        ?.filter((asset): asset is SearchAsset => !!asset),
    [searchReceiveAssetsSections],
  );

  const { data: rawAssetsToReceive } = useAssets({
    assetAddresses: searchReceiveAssets.map(({ uniqueId }) => uniqueId),
    currency: currentCurrency,
  });

  const assetsToReceive: ParsedAddressAsset[] = useMemo(
    () =>
      Object.values(rawAssetsToReceive || {}).map((rawAsset) => {
        const userAsset = userAssets.find(
          (userAsset) =>
            isLowerCaseMatch(userAsset.address, rawAsset.address) &&
            userAsset.chainId === outputChainId,
        );
        const searchAsset = searchReceiveAssets.find(
          (searchAsset) => searchAsset.uniqueId === rawAsset.address,
        );
        return parseParsedAssetToParsedAddressAsset({
          rawAsset,
          userAsset,
          outputChainId,
          searchAsset,
        });
      }),
    [rawAssetsToReceive, userAssets, searchReceiveAssets, outputChainId],
  );

  const assetsToReceivee = useMemo(() => {
    return searchReceiveAssetsSections.map(({ data, title }) => {
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
  }, [assetsToReceive, searchReceiveAssetsSections]);

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
