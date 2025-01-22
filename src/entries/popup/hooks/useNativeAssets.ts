import { useMemo } from 'react';

import { useExternalTokens } from '~/core/resources/assets/externalToken';
import { useCurrentCurrencyStore } from '~/core/state';
import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { AddressOrEth, ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export function useNativeAssets() {
  const chainsNativeAsset = useBackendNetworksStore((state) =>
    state.getChainsNativeAsset(),
  );
  const NATIVE_ASSETS = useMemo(
    () =>
      Object.keys(chainsNativeAsset).map((chainId) => ({
        address: chainsNativeAsset[+chainId].address as AddressOrEth,
        chainId: +chainId,
      })),
    [chainsNativeAsset],
  );

  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const response = useExternalTokens({
    assets: NATIVE_ASSETS,
    currency,
  });
  return response
    .map((asset) => (asset.data ? asset.data : null))
    .filter(Boolean)
    .reduce(
      (acc, asset) => {
        acc[asset.chainId] = asset;
        return acc;
      },
      {} as Record<ChainId, ParsedAsset>,
    );
}
