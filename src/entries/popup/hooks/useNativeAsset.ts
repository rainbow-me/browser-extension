import { AddressZero } from '@ethersproject/constants';
import { Address } from 'viem';
import { useConfig } from 'wagmi';

import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId, isCustomChain } from '~/core/utils/chains';

import { useCustomNetworkAsset } from './useCustomNetworkAsset';
import {
  getNetworkNativeAssetChainId,
  getNetworkNativeAssetUniqueId,
} from './useNativeAssetForNetwork';
import { useNativeAssets } from './useNativeAssets';
import { useUserAsset } from './useUserAsset';

const useMockNativeAsset = ({
  chainId,
}: {
  chainId: ChainId;
}): ParsedUserAsset | undefined | null => {
  const nativeAssets = useNativeAssets();
  const { chains } = useConfig();
  const chain = chains.find((c) => c.id === chainId);
  if (!nativeAssets || !chain) return null;
  const nativeAssetMetadataChainId = getNetworkNativeAssetChainId({ chainId });
  const nativeAsset = nativeAssets?.[nativeAssetMetadataChainId];
  return {
    ...nativeAsset,
    chainId: chain.id,
    chainName: chainNameFromChainId(chain.id),
    native: {
      balance: { amount: '0', display: `0 ${nativeAsset?.symbol}` },
    },
    balance: { amount: '0', display: `0 ${nativeAsset?.symbol}` },
  };
};

export const useNativeAsset = ({
  address,
  chainId,
}: {
  address?: Address;
  chainId: ChainId;
}): { nativeAsset?: ParsedUserAsset | null } => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { chains } = useConfig();
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: chainId || ChainId.mainnet,
  });
  console.log('-- nativeAssetUniqueId', nativeAssetUniqueId);
  const { data: userNativeAsset } = useUserAsset(
    nativeAssetUniqueId || '',
    address || currentAddress,
  );
  const mockNativeAsset = useMockNativeAsset({ chainId });

  const { data: testnetNativeAsset } = useUserTestnetNativeAsset({
    address: address || currentAddress,
    currency: currentCurrency,
    chainId,
  });

  const { data: customNetworkNativeAsset } = useCustomNetworkAsset({
    address: address || currentAddress,
    uniqueId: `${AddressZero}_${chainId}`,
    filterZeroBalance: false,
  });

  const chain = chains.find((chain) => chain.id === chainId);
  const isChainIdCustomNetwork = isCustomChain(chainId);
  console.log(
    '-- isChainIdCustomNetwork',
    isChainIdCustomNetwork,
    customNetworkNativeAsset,
  );
  console.log('-- chain?.testnet', chain, testnetNativeAsset);

  let nativeAsset: ParsedUserAsset | undefined | null;
  if (isChainIdCustomNetwork) {
    nativeAsset = customNetworkNativeAsset;
  } else if (chain?.testnet) {
    nativeAsset = testnetNativeAsset;
  } else {
    nativeAsset = userNativeAsset || mockNativeAsset;
  }
  return { nativeAsset };
};
