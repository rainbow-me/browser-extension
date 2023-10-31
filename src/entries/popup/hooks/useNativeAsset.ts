/* eslint-disable no-nested-ternary */
import { Zero } from '@ethersproject/constants';
import { useNetwork } from 'wagmi';

import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { isCustomNetwork } from '~/core/utils/customNetworks';

import { useCustomNetworkAsset } from './useCustomNetworkAsset';
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

  const { data: customNetworkNativeAsset } = useCustomNetworkAsset(
    `${Zero.toHexString()}_${chainId}`,
  );

  const chain = chains.find((chain) => chain.id === chainId);
  const isChainIdCustomNetwork = isCustomNetwork(chainId);
  const nativeAsset = isChainIdCustomNetwork
    ? customNetworkNativeAsset
    : chain?.testnet
    ? testnetNativeAsset
    : userNativeAsset;

  return { nativeAsset };
};
