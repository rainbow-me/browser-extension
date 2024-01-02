import { AddressZero } from '@ethersproject/constants';
import { Address, useNetwork } from 'wagmi';

import { NATIVE_ASSETS_MAP_PER_CHAIN } from '~/core/references';
import { useUserTestnetNativeAsset } from '~/core/resources/assets/userTestnetNativeAsset';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId, isCustomChain } from '~/core/utils/chains';

import { useCustomNetworkAsset } from './useCustomNetworkAsset';
import { getNetworkNativeAssetUniqueId } from './useNativeAssetForNetwork';
import { useNativeAssets } from './useNativeAssets';
import { useUserAsset } from './useUserAsset';

const useMockNativeAssets = ({
  chainId,
}: {
  chainId: ChainId;
}): ParsedUserAsset | undefined | null => {
  const nativeAssets = useNativeAssets();
  const { chains } = useNetwork();
  if (!nativeAssets) return null;
  return chains
    .map((chain) => {
      const assetKey = `${NATIVE_ASSETS_MAP_PER_CHAIN[chain.id]}_${
        ChainId.mainnet
      }`;
      const nativeAsset = nativeAssets[assetKey];
      return {
        ...nativeAsset,
        chainId: chain.id,
        chainName: chainNameFromChainId(chain.id),
        native: {
          balance: { amount: '0', display: `0 ${nativeAsset?.symbol}` },
        },
        balance: { amount: '0', display: `0 ${nativeAsset?.symbol}` },
      };
    })
    .find((c) => c.chainId === chainId);
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
  const { chains } = useNetwork();
  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: chainId || ChainId.mainnet,
  });
  const { data: userNativeAsset } = useUserAsset(
    nativeAssetUniqueId || '',
    address || currentAddress,
  );
  const mockNativeAsset = useMockNativeAssets({ chainId });

  const { data: testnetNativeAsset } = useUserTestnetNativeAsset({
    address: address || currentAddress,
    currency: currentCurrency,
    chainId,
  });

  const { data: customNetworkNativeAsset } = useCustomNetworkAsset({
    uniqueId: `${AddressZero}_${chainId}`,
    filterZeroBalance: false,
  });

  const chain = chains.find((chain) => chain.id === chainId);
  const isChainIdCustomNetwork = isCustomChain(chainId);

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
