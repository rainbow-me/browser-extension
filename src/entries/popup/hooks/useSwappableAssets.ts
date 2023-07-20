import { useMemo } from 'react';

import {
  selectUserAssetAddressMapByChainId,
  selectUserAssetsList,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useSwappableAddresses } from '~/core/resources/search/swappableAddresses';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export function useSwappableAssets(toChainId?: ChainId) {
  const { currentAddress: address } = useCurrentAddressStore();

  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const { data: userAssets } = useUserAssets({
    address,
    currency,
    connectedToHardhat,
  });

  const fullUserAssetList = selectUserAssetsList(userAssets);

  const assetAddressMap = selectUserAssetAddressMapByChainId(userAssets);

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
      [ChainId.hardhat]: {
        addresses: [],
        loading: [],
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
    ],
  );

  const isSwappableAsset = (asset: ParsedAddressAsset) => {
    const { address, chainId } = asset;
    if (chainId === toChainId) return true;
    const { addresses, loading } = swappableInfo[chainId];
    return loading || addresses?.includes(address);
  };

  if (!toChainId) return fullUserAssetList;

  return fullUserAssetList.filter((asset) => isSwappableAsset(asset));
}
