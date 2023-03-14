import { useEffect, useMemo, useState } from 'react';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useFavoritesStore } from '~/core/state/favorites';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { parseSearchAsset } from '~/core/utils/assets';
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

  const { results: searchAssetsToBuySections } = useSearchCurrencyLists({
    inputChainId: assetToSell?.chainId,
    outputChainId,
    searchQuery: debouncedAssetToBuyFilter,
  });

  const { data: assetsWithPrice = [] } = useAssets({
    assetAddresses: [
      ...searchAssetsToBuySections
        .map(
          (section) => section.data?.map((asset) => asset.mainnetAddress) || [],
        )
        .flat(),
    ],
    currency: currentCurrency,
  });

  const assetToBuyWithPrice = useMemo(
    () =>
      Object.values(assetsWithPrice || {})?.find(
        (asset) => asset.mainnetAddress === assetToBuy?.mainnetAddress,
      ),
    [assetToBuy, assetsWithPrice],
  );

  const parsedAssetToBuy = useMemo(() => {
    if (!assetToBuy) return null;
    const userAsset = userAssets.find((userAsset) =>
      isLowerCaseMatch(userAsset.address, assetToBuy?.address),
    );
    return parseSearchAsset({
      assetWithPrice: assetToBuyWithPrice,
      searchAsset: assetToBuy,
      userAsset,
    });
  }, [assetToBuy, userAssets, assetToBuyWithPrice]);

  const parsedAssetToSell = useMemo(() => {
    if (!assetToSell) return null;
    const userAsset = userAssets.find((userAsset) =>
      isLowerCaseMatch(userAsset.address, assetToSell?.address),
    );
    return parseSearchAsset({
      searchAsset: assetToSell,
      userAsset,
    });
  }, [assetToSell, userAssets]);

  const assetsToBuyBySection = useMemo(
    () =>
      searchAssetsToBuySections.map(({ data = [], title, symbol, id }) => {
        const parsedData: SearchAsset[] = data.filter((asset) => {
          const shouldFilterFavorite =
            id !== 'favorites' &&
            favorites[outputChainId].includes(asset.address);
          const isSellToken = asset.uniqueId === assetToSell?.uniqueId;
          return !shouldFilterFavorite && !isSellToken;
        });
        return { data: parsedData, title, symbol, id };
      }),
    [
      assetToSell?.uniqueId,
      favorites,
      outputChainId,
      searchAssetsToBuySections,
    ],
  );

  // if output chain id changes we need to clear the receive asset
  useEffect(() => {
    if (prevOutputChainId !== outputChainId) {
      setAssetToBuy(null);
    }
  }, [outputChainId, prevOutputChainId, setAssetToBuy]);

  // if user selects assetToBuy as assetToSell we need to flip assets
  useEffect(() => {
    if (assetToBuy?.address === assetToSell?.address) {
      setAssetToBuy(prevAssetToSell === undefined ? null : prevAssetToSell);
    }
  }, [
    assetToBuy?.address,
    assetToSell?.address,
    prevAssetToSell,
    setAssetToBuy,
  ]);

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
