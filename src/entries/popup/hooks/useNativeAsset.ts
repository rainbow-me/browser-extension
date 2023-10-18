/* eslint-disable no-nested-ternary */
import { useNetwork } from 'wagmi';

import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';

import { getNetworkNativeAssetUniqueId } from './useNativeAssetForNetwork';
import { useUserAsset } from './useUserAsset';

export const useNativeAsset = ({ chainId }: { chainId: ChainId }) => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useNetwork();
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: chainId || ChainId.mainnet,
  });
  const { data: userNativeAsset } = useUserAsset(nativeAssetUniqueId || '');
  const { data: testnetNativeAsset } = useUserTestnetNativeAsset({
    address: currentAddress,
    currency: currentCurrency,
    chainId,
  });

  const chain = chains.find((chain) => chain.id === chainId);
  const nativeAsset = chain?.testnet ? testnetNativeAsset : userNativeAsset;

  return { nativeAsset };
};
