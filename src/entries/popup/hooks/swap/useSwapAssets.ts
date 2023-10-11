import { useCallback, useMemo, useState } from 'react';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectUserAssetsListByChainId } from '~/core/resources/_selectors/assets';
import { useAssets, useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ParsedAsset, ParsedSearchAsset } from '~/core/types/assets';
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

export const isSameAsset = (
  a1: Pick<ParsedAsset, 'chainId' | 'address'>,
  a2: Pick<ParsedAsset, 'chainId' | 'address'>,
) => +a1.chainId === +a2.chainId && isLowerCaseMatch(a1.address, a2.address);

const isSameAssetInDiffChains = (
  a1?: Pick<ParsedAsset, 'address' | 'networks'> | null,
  a2?: Pick<ParsedAsset, 'address'> | null,
) => {
  if (!a1?.networks || !a2) return false;
  return Object.values(a1.networks).some(
    (assetInNetwork) => assetInNetwork?.address === a2.address,
  );
};

export const useSwapAssets = ({ bridge }: { bridge: boolean }) => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const [assetToSell, setAssetToSellState] = useState<
    ParsedSearchAsset | SearchAsset | null
  >(null);
  const [assetToBuy, setAssetToBuyState] = useState<
    ParsedSearchAsset | SearchAsset | null
  >(null);

  const prevAssetToSell = usePrevious<ParsedSearchAsset | SearchAsset | null>(
    assetToSell,
  );

  const [outputChainId, setOutputChainId] = useState(ChainId.mainnet);

  const [sortMethod, setSortMethod] = useState<SortMethod>('token');

  const [assetToSellFilter, setAssetToSellFilter] = useState('');
  const [assetToBuyFilter, setAssetToBuyFilter] = useState('');

  const debouncedAssetToSellFilter = useDebounce(assetToSellFilter, 200);
  const debouncedAssetToBuyFilter = useDebounce(assetToBuyFilter, 200);

  const { saveSwapTokenToBuy, saveSwapTokenToSell } = usePopupInstanceStore();

  const { data: userAssets = [] } = useUserAssets(
    {
      address: currentAddress,
      currency: currentCurrency,
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
    assetToSell,
    searchQuery: debouncedAssetToBuyFilter,
    bridge,
  });

  const { data: buyPriceData = [] } = useAssets({
    assetAddresses: assetToBuy ? [assetToBuy?.address] : [],
    chainId: outputChainId,
    currency: currentCurrency,
  });

  const { data: sellPriceData = [] } = useAssets({
    assetAddresses: assetToSell ? [assetToSell?.address] : [],
    chainId: outputChainId,
    currency: currentCurrency,
  });

  const assetToBuyWithPrice = useMemo(
    () =>
      Object.values(buyPriceData || {})?.find(
        (asset) => asset.uniqueId === assetToBuy?.uniqueId,
      ),
    [assetToBuy, buyPriceData],
  );

  const assetToSellWithPrice = useMemo(
    () =>
      Object.values(sellPriceData || {})?.find(
        (asset) => asset.uniqueId === assetToBuy?.uniqueId,
      ),
    [assetToBuy, sellPriceData],
  );

  const parsedAssetToBuy = useMemo(() => {
    if (!assetToBuy) return null;
    const userAsset = userAssets.find((userAsset) =>
      isSameAsset(userAsset, assetToBuy),
    );
    return parseSearchAsset({
      assetWithPrice: assetToBuyWithPrice,
      searchAsset: assetToBuy,
      userAsset,
    });
  }, [assetToBuy, assetToBuyWithPrice, userAssets]);

  const parsedAssetToSell = useMemo(() => {
    if (!assetToSell) return null;
    const userAsset = userAssets.find((userAsset) =>
      isSameAsset(userAsset, assetToSell),
    );
    return parseSearchAsset({
      assetWithPrice: assetToSellWithPrice,
      searchAsset: assetToSell,
      userAsset,
    });
  }, [assetToSell, assetToSellWithPrice, userAssets]);

  const setAssetToBuy = useCallback(
    (asset: ParsedSearchAsset | null) => {
      saveSwapTokenToBuy({ token: asset });
      setAssetToBuyState(asset);
    },
    [saveSwapTokenToBuy],
  );

  const setAssetToSell = useCallback(
    (asset: ParsedSearchAsset | null) => {
      if (
        assetToBuy &&
        asset &&
        assetToBuy?.address === asset?.address &&
        assetToBuy?.chainId === asset?.chainId
      ) {
        setAssetToBuyState(
          prevAssetToSell === undefined ? null : prevAssetToSell,
        );
      }
      // if it's in bridge mode, the asset to sell changes, and it's not the same asset in different chains,
      // we clear the asset to buy (because that would be a crosschain swap)
      if (bridge && !isSameAssetInDiffChains(asset, assetToBuy)) {
        setAssetToBuyState(null);
      }
      setAssetToSellState(asset);
      saveSwapTokenToSell({ token: asset });
      asset?.chainId && setOutputChainId(asset?.chainId);
    },
    [assetToBuy, prevAssetToSell, saveSwapTokenToSell, bridge],
  );

  return {
    assetsToSell: filteredAssetsToSell,
    assetToSellFilter,
    assetsToBuy: searchAssetsToBuySections,
    assetToBuyFilter,
    sortMethod,
    assetToSell: parsedAssetToSell,
    assetToBuy: parsedAssetToBuy,
    outputChainId: bridge ? undefined : outputChainId,
    setSortMethod,
    setAssetToSell,
    setAssetToBuy,
    setOutputChainId: bridge ? undefined : setOutputChainId,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  };
};
