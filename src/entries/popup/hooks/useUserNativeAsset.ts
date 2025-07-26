import { AddressZero } from '@ethersproject/constants';
import { Address } from 'viem';
import { useConfig } from 'wagmi';

import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isCustomChain } from '~/core/utils/chains';

import { useCustomNetworkAsset } from './useCustomNetworkAsset';
import { getNetworkNativeAssetUniqueId } from './useNativeAssetForNetwork';
import { useUserAsset } from './useUserAsset';

export const useUserNativeAsset = ({
  address,
  chainId,
}: {
  address?: Address;
  chainId: ChainId;
}): { nativeAsset?: ParsedUserAsset | null; isLoading: boolean } => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useConfig();
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId,
  });
  const { data: userNativeAsset, isLoading: isUserAssetLoading } = useUserAsset(
    nativeAssetUniqueId || '',
    address || currentAddress,
  );

  const { data: testnetNativeAsset, isLoading: isTestnetAssetLoading } =
    useUserTestnetNativeAsset({
      address: address || currentAddress,
      currency: currentCurrency,
      chainId,
    });

  const {
    data: customNetworkNativeAsset,
    isLoading: isCustomNetworkAssetLoading,
  } = useCustomNetworkAsset({
    address: address || currentAddress,
    uniqueId: `${AddressZero}_${chainId}`,
    filterZeroBalance: false,
  });

  const chain = chains.find((chain) => chain.id === chainId);
  const isChainIdCustomNetwork = isCustomChain(chainId);

  let nativeAsset: ParsedUserAsset | undefined | null;
  let isLoading = false;
  if (isChainIdCustomNetwork) {
    nativeAsset = customNetworkNativeAsset;
    isLoading = isCustomNetworkAssetLoading;
  } else if (chain?.testnet) {
    nativeAsset = testnetNativeAsset;
    isLoading = isTestnetAssetLoading;
  } else {
    nativeAsset = userNativeAsset;
    isLoading = isUserAssetLoading;
  }
  return { nativeAsset, isLoading };
};
