/* eslint-disable no-nested-ternary */
import { AddressZero } from '@ethersproject/constants';
import { Address, useNetwork } from 'wagmi';

import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { isCustomChain } from '~/core/utils/chains';

import { useCustomNetworkAsset } from './useCustomNetworkAsset';
import { getNetworkNativeAssetUniqueId } from './useNativeAssetForNetwork';
import { useUserAsset } from './useUserAsset';

export const useNativeAsset = ({
  address,
  chainId,
}: {
  address?: Address;
  chainId: ChainId;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useNetwork();
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: chainId || ChainId.mainnet,
  });
  const { data: userNativeAsset } = useUserAsset(
    nativeAssetUniqueId || '',
    address || currentAddress,
  );
  const { data: testnetNativeAsset } = useUserTestnetNativeAsset({
    address: address || currentAddress,
    currency: currentCurrency,
    chainId,
  });

  const { data: customNetworkNativeAsset } = useCustomNetworkAsset(
    `${AddressZero}_${chainId}`,
  );

  const chain = chains.find((chain) => chain.id === chainId);
  const isChainIdCustomNetwork = isCustomChain(chainId);
  const nativeAsset = isChainIdCustomNetwork
    ? customNetworkNativeAsset
    : chain?.testnet
    ? testnetNativeAsset
    : userNativeAsset;

  return { nativeAsset };
};
