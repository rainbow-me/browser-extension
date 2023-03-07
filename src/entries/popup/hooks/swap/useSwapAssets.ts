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
import { chainNameFromChainId } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { SortMethod } from '../send/useSendAsset';
import { useDebounce } from '../useDebounce';
import { useFavoriteAssets } from '../useFavoriteAssets';
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
}): ParsedAddressAsset => {
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
      balance: userAsset?.native.balance || {
        amount: '0',
        display: '0.00',
      },
      price: rawAsset.native.price,
    },
    balance: userAsset?.balance || { amount: '0', display: '0.00' },
    icon_url:
      userAsset?.icon_url || rawAsset?.icon_url || searchAsset?.icon_url,
    colors: searchAsset?.colors || rawAsset?.colors,
    chainName: chainNameFromChainId(chainId),
  };
};

export const useSwapAssets = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const [assetToSell, setAssetToSell] = useState<ParsedAddressAsset | null>(
    null,
  );
  const [assetToBuy, setAssetToBuy] = useState<ParsedAddressAsset | null>(null);

  const prevAssetToSell = usePrevious<ParsedAddressAsset | null>(assetToSell);

  const [outputChainId, setOutputChainId] = useState(ChainId.mainnet);
  const prevOutputChainId = usePrevious(outputChainId);

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [assetToSellFilter, setAssetToSellFilter] = useState('');
  const [assetToBuyFilter, setAssetToBuyFilter] = useState('');

  const debouncedAssetToSellFilter = useDebounce(assetToSellFilter, 200);
  const debouncedAssetToBuyFilter = useDebounce(assetToBuyFilter, 200);

  const { favoriteAddresses } = useFavoriteAssets();

  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
      connectedToHardhat,
    },
    { select: sortBy(sortMethod) },
  );

  const filteredAssetsToSell = useMemo(() => {
    return debouncedAssetToSellFilter
      ? userAssets.filter(({ name, symbol, address }) =>
          [name, symbol, address].reduce(
            (res, param) =>
              res ||
              param
                .toLowerCase()
                .startsWith(debouncedAssetToSellFilter.toLowerCase()),
            false,
          ),
        )
      : userAssets;
  }, [debouncedAssetToSellFilter, userAssets]);

  const { results: searchReceiveAssetsSections } = useSearchCurrencyLists({
    inputChainId: assetToSell?.chainId,
    outputChainId,
    searchQuery: debouncedAssetToBuyFilter,
  });

  const searchReceiveAssets = useMemo(
    () =>
      searchReceiveAssetsSections
        ?.map(({ data }) => data)
        .flat()
        ?.filter((asset): asset is SearchAsset => !!asset),
    [searchReceiveAssetsSections],
  );

  const hash = searchReceiveAssets
    .map(({ mainnetAddress }) => mainnetAddress)
    .join('');

  const { data: rawAssetsToBuy } = useAssets({
    assetAddresses: {
      [outputChainId as ChainId]: searchReceiveAssets.map(
        ({ mainnetAddress }) => mainnetAddress,
      ),
    },
    hash,
    currency: currentCurrency,
  });

  console.log('raw: ', rawAssetsToBuy);

  const assetsToBuy: ParsedAddressAsset[] = useMemo(
    () =>
      Object.values(rawAssetsToBuy || {})
        .filter((rawAsset) => rawAsset.address !== assetToSell?.address)
        .map((rawAsset) => {
          const userAsset = userAssets.find((userAsset) =>
            isLowerCaseMatch(userAsset.address, rawAsset.address),
          );
          const searchAsset = searchReceiveAssets.find(
            (searchAsset) => searchAsset.mainnetAddress === rawAsset.address,
          );
          return parseParsedAssetToParsedAddressAsset({
            rawAsset,
            userAsset,
            outputChainId,
            searchAsset,
          });
        }),
    [
      rawAssetsToBuy,
      assetToSell?.address,
      userAssets,
      searchReceiveAssets,
      outputChainId,
    ],
  );

  console.log('assets to buy: ', assetsToBuy);

  const assetsToBuyBySection = useMemo(() => {
    return searchReceiveAssetsSections.map(({ data, title, symbol, id }) => {
      const parsedData: ParsedAddressAsset[] =
        data
          ?.map((asset) =>
            assetsToBuy.find((parsedAsset) =>
              isLowerCaseMatch(parsedAsset.uniqueId, asset?.uniqueId),
            ),
          )
          ?.filter((p): p is ParsedAddressAsset => {
            const shouldFilterFavorite =
              id !== 'favorites' &&
              favoriteAddresses[outputChainId].includes(
                (p?.address || '') as Address,
              );
            return !!p && !shouldFilterFavorite;
          }) || [];
      return { data: parsedData, title, symbol, id };
    });
  }, [
    assetsToBuy,
    favoriteAddresses,
    outputChainId,
    searchReceiveAssetsSections,
  ]);

  // if output chain id changes we need to clear the receive asset
  useEffect(() => {
    if (prevOutputChainId !== outputChainId) {
      setAssetToBuy(null);
    }
  }, [outputChainId, prevOutputChainId]);

  // if user selects assetToBuy as assetToSell we need to flip assets
  useEffect(() => {
    if (assetToBuy?.address === assetToSell?.address) {
      setAssetToBuy(prevAssetToSell === undefined ? null : prevAssetToSell);
    }
  }, [assetToBuy?.address, assetToSell?.address, prevAssetToSell]);

  return {
    assetsToSell: filteredAssetsToSell,
    assetToSellFilter,
    assetsToBuy: assetsToBuyBySection,
    assetToBuyFilter,
    sortMethod,
    assetToSell,
    assetToBuy,
    outputChainId,
    setSortMethod,
    setAssetToSell,
    setAssetToBuy,
    setOutputChainId,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  };
};
