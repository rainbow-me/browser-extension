import { ETH_ADDRESS } from '~/core/references';
import {
  fetchExternalToken,
  useExternalToken,
} from '~/core/resources/assets/externalToken';
import { currentCurrencyStore, useCurrentCurrencyStore } from '~/core/state';
import { networkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';

export const useNativeAsset = ({ chainId }: { chainId: ChainId }) => {
  const nativeAssetAddress = networkStore(
    (state) => state.getNetworksNativeAsset()[chainId].address || ETH_ADDRESS,
  );
  const { currentCurrency } = useCurrentCurrencyStore();

  const { data: nativeAsset } = useExternalToken({
    address: nativeAssetAddress,
    chainId,
    currency: currentCurrency,
  });

  return nativeAsset;
};

export const fetchNativeAsset = async ({ chainId }: { chainId: ChainId }) => {
  const currentCurrency = currentCurrencyStore.getState().currentCurrency;
  const nativeAssetAddress =
    networkStore.getState().getNetworksNativeAsset()[chainId].address ||
    ETH_ADDRESS;
  return await fetchExternalToken({
    address: nativeAssetAddress,
    chainId,
    currency: currentCurrency,
  });
};
