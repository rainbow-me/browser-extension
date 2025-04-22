import { ETH_ADDRESS } from '~/core/references';
import {
  fetchExternalToken,
  useExternalToken,
} from '~/core/resources/assets/externalToken';
import { useCurrentCurrencyStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';

export const useNativeAsset = ({ chainId }: { chainId: ChainId }) => {
  const nativeAssetAddress = useNetworkStore(
    (state) => state.getChainsNativeAsset()[chainId]?.address || ETH_ADDRESS,
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
  const currentCurrency = useCurrentCurrencyStore.getState().currentCurrency;
  const nativeAssetAddress =
    useNetworkStore.getState().getChainsNativeAsset()[chainId]?.address ||
    ETH_ADDRESS;
  return await fetchExternalToken({
    address: nativeAssetAddress,
    chainId,
    currency: currentCurrency,
  });
};
