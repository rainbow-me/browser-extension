import { useMemo } from 'react';

import {
  selectUserAssetAddressMapByChainId,
  selectUserAssetsList,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useSwappableAddresses } from '~/core/resources/search/swappableAddresses';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedAssetsDictByChain, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export function useSwappableAssets(toChainId?: ChainId) {
  const { currentAddress: address } = useCurrentAddressStore();

  const { currentCurrency: currency } = useCurrentCurrencyStore();

  const { data: userAssets } = useUserAssets({
    address,
    currency,
  });

  const fullUserAssetList = selectUserAssetsList(
    userAssets || ({} as ParsedAssetsDictByChain),
  );
  const assetAddressMap = selectUserAssetAddressMapByChainId(
    userAssets || ({} as ParsedAssetsDictByChain),
  );

  const {
    data: swappableMainnetAddresses,
    isLoading: swappableMainnetAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.mainnet],
    fromChainId: ChainId.mainnet,
    toChainId,
  });

  const {
    data: swappableOptimismAddresses,
    isLoading: swappableOptimismAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.optimism],
    fromChainId: ChainId.optimism,
    toChainId,
  });

  const {
    data: swappableBaseAddresses,
    isLoading: swappableBaseAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.base],
    fromChainId: ChainId.base,
    toChainId,
  });

  const {
    data: swappableZoraAddresses,
    isLoading: swappableZoraAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.zora],
    fromChainId: ChainId.zora,
    toChainId,
  });

  const {
    data: swappableBscAddresses,
    isLoading: swappableBscAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.bsc],
    fromChainId: ChainId.bsc,
    toChainId,
  });

  const {
    data: swappablePolygonAddresses,
    isLoading: swappablePolygonAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.polygon],
    fromChainId: ChainId.polygon,
    toChainId,
  });

  const {
    data: swappableArbitrumAddresses,
    isLoading: swappableArbitrumAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.arbitrum],
    fromChainId: ChainId.arbitrum,
    toChainId,
  });

  const {
    data: swappableAvalancheAddresses,
    isLoading: swappableAvalancheAddressesAreLoading,
  } = useSwappableAddresses({
    addresses: assetAddressMap[ChainId.avalanche],
    fromChainId: ChainId.avalanche,
    toChainId,
  });

  const swappableInfo = useMemo(
    () => ({
      [ChainId.mainnet]: {
        addresses: swappableMainnetAddresses,
        loading: swappableMainnetAddressesAreLoading,
      },
      [ChainId.optimism]: {
        addresses: swappableOptimismAddresses,
        loading: swappableOptimismAddressesAreLoading,
      },
      [ChainId.bsc]: {
        addresses: swappableBscAddresses,
        loading: swappableBscAddressesAreLoading,
      },
      [ChainId.polygon]: {
        addresses: swappablePolygonAddresses,
        loading: swappablePolygonAddressesAreLoading,
      },
      [ChainId.arbitrum]: {
        addresses: swappableArbitrumAddresses,
        loading: swappableArbitrumAddressesAreLoading,
      },
      [ChainId.base]: {
        addresses: swappableBaseAddresses,
        loading: swappableBaseAddressesAreLoading,
      },
      [ChainId.zora]: {
        addresses: swappableZoraAddresses,
        loading: swappableZoraAddressesAreLoading,
      },
      [ChainId.avalanche]: {
        addresses: swappableAvalancheAddresses,
        loading: swappableAvalancheAddressesAreLoading,
      },
    }),
    [
      swappableArbitrumAddresses,
      swappableArbitrumAddressesAreLoading,
      swappableBscAddresses,
      swappableBscAddressesAreLoading,
      swappableMainnetAddresses,
      swappableMainnetAddressesAreLoading,
      swappableOptimismAddresses,
      swappableOptimismAddressesAreLoading,
      swappablePolygonAddresses,
      swappablePolygonAddressesAreLoading,
      swappableBaseAddresses,
      swappableBaseAddressesAreLoading,
      swappableZoraAddresses,
      swappableZoraAddressesAreLoading,
      swappableAvalancheAddresses,
      swappableAvalancheAddressesAreLoading,
    ],
  );

  const isSwappableAsset = (asset: ParsedUserAsset) => {
    const { address, chainId } = asset;
    if (chainId === toChainId) return true;
    const { addresses, loading } = swappableInfo[chainId];
    return loading || addresses?.includes(address);
  };

  if (!toChainId) return fullUserAssetList;

  return fullUserAssetList.filter((asset) => isSwappableAsset(asset));
}
