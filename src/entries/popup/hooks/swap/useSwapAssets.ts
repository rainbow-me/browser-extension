import { useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFavoritesStore } from '~/core/state/favorites';
import {
  ParsedAddressAsset,
  ParsedAsset,
  ParsedSearchAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { chainNameFromChainId } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { SortMethod } from '../send/useSendAsset';
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

const parseSearchAsset = ({
  outputChainId,
  rawAsset,
  userAsset,
  searchAsset,
}: {
  rawAsset?: ParsedAsset;
  userAsset?: ParsedAddressAsset;
  outputChainId: ChainId;
  searchAsset: ParsedSearchAsset | SearchAsset;
}): ParsedSearchAsset => {
  const assetNetworkInformation = searchAsset?.networks?.[outputChainId];
  // if searchAsset is appearing because it found an exact match
  // "on other networks" we need to take the first network, decimals and address to
  // use for the asset

  const networks = Object.entries(searchAsset?.networks || {});
  const assetInOneNetwork = networks.length === 1;

  const address = assetInOneNetwork
    ? networks?.[0]?.[1].address
    : assetNetworkInformation?.address ||
      userAsset?.address ||
      rawAsset?.address ||
      searchAsset?.address;

  const decimals = assetInOneNetwork
    ? networks?.[0]?.[1].decimals
    : assetNetworkInformation?.decimals || rawAsset?.decimals || 0;
  const chainId = assetInOneNetwork ? Number(networks[0][0]) : outputChainId;

  return {
    ...(rawAsset || {}),
    ...searchAsset,
    decimals,
    address,
    chainId,
    native: {
      balance: userAsset?.native.balance || {
        amount: '0',
        display: '0.00',
      },
      price: rawAsset?.native.price,
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

  const [assetToSell, setAssetToSell] = useState<
    ParsedSearchAsset | SearchAsset | null
  >(null);
  const [assetToBuy, setAssetToBuy] = useState<
    ParsedSearchAsset | SearchAsset | null
  >(null);

  const prevAssetToSell = usePrevious<ParsedSearchAsset | SearchAsset | null>(
    assetToSell,
  );

  const [outputChainId, setOutputChainId] = useState(ChainId.mainnet);
  const prevOutputChainId = usePrevious(outputChainId);

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [assetToSellFilter, setAssetToSellFilter] = useState('');
  const [assetToBuyFilter, setAssetToBuyFilter] = useState('');

  const debouncedAssetToSellFilter = useDebounce(assetToSellFilter, 200);
  const debouncedAssetToBuyFilter = useDebounce(assetToBuyFilter, 200);

  const { favorites } = useFavoritesStore();

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
  }, [debouncedAssetToSellFilter, userAssets]) as ParsedSearchAsset[];

  const { results: searchReceiveAssetsSections } = useSearchCurrencyLists({
    inputChainId: assetToSell?.chainId,
    outputChainId,
    searchQuery: debouncedAssetToBuyFilter,
  });

  const assetAddresses = useMemo(() => {
    const dict: Record<ChainId, Address[]> = {};
    if (assetToBuy) {
      dict[assetToBuy.chainId] = [
        assetToBuy?.mainnetAddress || assetToBuy?.address || '',
      ];
    }
    if (assetToSell) {
      const addressesForNetwork = dict[assetToSell.chainId] || [];
      dict[assetToSell.chainId] = [
        ...addressesForNetwork,
        assetToSell?.mainnetAddress || assetToSell?.address || '',
      ];
    }
    return dict;
  }, [assetToBuy, assetToSell]);

  const { data: rawAssetsWithPrice } = useAssets(
    {
      assetAddresses,
      currency: currentCurrency,
    },
    {
      enabled: !!assetToSell?.address || !!assetToBuy?.address,
      select: (assetsWithPrices) => {
        const assetToBuyWithPrice =
          assetsWithPrices?.[assetToBuy?.uniqueId || ''];
        const assetToSellWithPrice =
          assetsWithPrices?.[assetToSell?.uniqueId || ''];
        return { buy: assetToBuyWithPrice, sell: assetToSellWithPrice };
      },
    },
  );

  const { buy: rawAssetToBuy, sell: rawAssetToSell } = rawAssetsWithPrice || {};

  const parsedAssetToBuy = useMemo(() => {
    if (assetToBuy) {
      const userAsset = userAssets.find((userAsset) =>
        isLowerCaseMatch(userAsset.address, rawAssetToBuy?.address),
      );
      if (rawAssetToBuy) {
        return parseSearchAsset({
          rawAsset: rawAssetToBuy,
          userAsset,
          outputChainId: assetToBuy.chainId,
          searchAsset: assetToBuy,
        });
      }
    }
    return null;
  }, [assetToBuy, rawAssetToBuy, userAssets]);

  const parsedAssetToSell = useMemo(() => {
    if (assetToSell) {
      const userAsset = userAssets.find((userAsset) =>
        isLowerCaseMatch(userAsset.address, rawAssetToSell?.address),
      );
      return parseSearchAsset({
        rawAsset: rawAssetToSell,
        userAsset,
        outputChainId: assetToSell.chainId,
        searchAsset: assetToSell,
      });
    }
    return null;
  }, [assetToSell, rawAssetToSell, userAssets]);

  const assetsToBuyBySection = useMemo(() => {
    return searchReceiveAssetsSections.map(({ data, title, symbol, id }) => {
      const parsedData: SearchAsset[] =
        data?.filter((p) => {
          const shouldFilterFavorite =
            id !== 'favorites' &&
            favorites[outputChainId].includes((p?.address || '') as Address);
          return !shouldFilterFavorite;
        }) || [];
      return { data: parsedData, title, symbol, id };
    });
  }, [favorites, outputChainId, searchReceiveAssetsSections]);

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
    assetToSell: parsedAssetToSell,
    assetToBuy: parsedAssetToBuy,
    outputChainId,
    setSortMethod,
    setAssetToSell,
    setAssetToBuy,
    setOutputChainId,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  };
};
