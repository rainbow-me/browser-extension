import { ETH_ADDRESS } from '~/core/references';
import {
  fetchExternalToken,
  useExternalToken,
} from '~/core/resources/assets/externalToken';
import { currentCurrencyStore, useCurrentCurrencyStore } from '~/core/state';
import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export const useNativeAsset = ({ chainId }: { chainId: ChainId }) => {
  const chainsNativeAsset = useBackendNetworksStore((state) =>
    state.getChainsNativeAsset(),
  );
  const address = (chainsNativeAsset[chainId].address ||
    ETH_ADDRESS) as AddressOrEth;
  const { currentCurrency } = useCurrentCurrencyStore();

  const { data: nativeAsset } = useExternalToken({
    address,
    chainId,
    currency: currentCurrency,
  });

  return nativeAsset;
};

export const fetchNativeAsset = async ({ chainId }: { chainId: ChainId }) => {
  const chainsNativeAsset = useBackendNetworksStore
    .getState()
    .getChainsNativeAsset();
  const currentCurrency = currentCurrencyStore.getState().currentCurrency;
  const address = (chainsNativeAsset[chainId].address ||
    ETH_ADDRESS) as AddressOrEth;
  return await fetchExternalToken({
    address,
    chainId,
    currency: currentCurrency,
  });
};
