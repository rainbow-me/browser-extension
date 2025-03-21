import { isValidAddress } from '@ethereumjs/util';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Address, isAddress } from 'viem';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { AddressOrEth } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';
import { getAssetMetadata, getCustomChainIconUrl } from '~/core/utils/assets';
import { isNativeAsset } from '~/core/utils/chains';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';

// ///////////////////////////////////////////////
// Query Types

type AssetMetadataArgs = {
  assetAddress?: Address;
  chainId: number;
};

type AssetMetadataAllNetworksArgs = {
  assetAddress?: Address;
};

// ///////////////////////////////////////////////
// Query Key

export const assetMetadataQueryKey = ({
  assetAddress,
  chainId,
}: AssetMetadataArgs) =>
  createQueryKey(
    'assetMetadata',
    { assetAddress, chainId },
    { persisterVersion: 2 },
  );

type AssetMetadataQueryKey = ReturnType<typeof assetMetadataQueryKey>;

export const assetSearchMetadataQueryKey = ({
  assetAddress,
  chainId,
}: AssetMetadataArgs) =>
  createQueryKey(
    'assetSearchMetadata',
    { assetAddress, chainId },
    { persisterVersion: 2 },
  );

type AssetSearchMetadataQueryKey = ReturnType<
  typeof assetSearchMetadataQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function assetMetadataQueryFunction({
  queryKey: [{ assetAddress, chainId }],
}: QueryFunctionArgs<typeof assetMetadataQueryKey>) {
  if (assetAddress && isValidAddress(assetAddress)) {
    const metadata = await getAssetMetadata({
      address: assetAddress,
      chainId: Number(chainId),
    });
    return {
      address: assetAddress,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      name: metadata.name,
    };
  }
}

async function assetSearchMetadataQueryFunction({
  queryKey: [{ assetAddress, chainId }],
}: QueryFunctionArgs<typeof assetSearchMetadataQueryKey>) {
  // Skip invalid addresses immediately
  if (!assetAddress || !isAddress(assetAddress)) {
    return null;
  }

  try {
    const metadata = await getAssetMetadata({
      address: assetAddress,
      chainId: Number(chainId),
    });

    const { decimals, symbol, name } = metadata || {};

    if (!decimals || !symbol || !name) {
      return null;
    }

    return parseSearchAssetMetadata({
      address: assetAddress,
      decimals,
      symbol,
      name,
      chainId,
    });
  } catch (error) {
    // Don't cache errors
    return null;
  }
}

export type AssetMetadataResult = QueryFunctionResult<
  typeof assetMetadataQueryFunction
>;

type AssetSearchMetadataResult = QueryFunctionResult<
  typeof assetSearchMetadataQueryFunction
>;

export function parseSearchAssetMetadata({
  address,
  symbol,
  decimals,
  name,
  chainId,
}: {
  address: AddressOrEth;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number;
}): SearchAsset {
  return {
    address,
    name,
    networks: {},
    chainId,
    symbol,
    decimals,
    highLiquidity: false,
    isVerified: false,
    isNativeAsset: isNativeAsset(address, chainId),
    mainnetAddress: address,
    uniqueId: `${address}_${chainId}`,
    icon_url: getCustomChainIconUrl(chainId, address),
  };
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssetMetadata(
  { assetAddress, chainId }: AssetMetadataArgs,
  config: QueryConfig<
    AssetMetadataResult,
    Error,
    AssetMetadataResult,
    AssetMetadataQueryKey
  > = {},
) {
  return useQuery({
    queryKey: assetMetadataQueryKey({
      assetAddress,
      chainId,
    }),
    queryFn: assetMetadataQueryFunction,
    ...config,
  });
}

export function useAssetSearchMetadata(
  { assetAddress, chainId }: AssetMetadataArgs,
  config: QueryConfig<
    AssetSearchMetadataResult,
    Error,
    AssetSearchMetadataResult,
    AssetSearchMetadataQueryKey
  > = {},
) {
  return useQuery({
    queryKey: assetSearchMetadataQueryKey({
      assetAddress,
      chainId,
    }),
    queryFn: assetSearchMetadataQueryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: Boolean(assetAddress && chainId),
    ...config,
  });
}

export function useAssetSearchMetadataAllNetworks(
  { assetAddress }: AssetMetadataAllNetworksArgs,
  config: QueryConfig<
    AssetSearchMetadataResult,
    Error,
    AssetSearchMetadataResult,
    AssetSearchMetadataQueryKey
  > = {},
) {
  const { chains: userChains } = useUserChains();

  const queries = useQueries({
    queries: userChains.map((chain) => ({
      queryKey: assetSearchMetadataQueryKey({
        assetAddress,
        chainId: chain.id,
      }),
      queryFn: assetSearchMetadataQueryFunction,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: false,
      enabled: Boolean(assetAddress),
      gcTime: 0,
      ...config,
    })),
  });

  return {
    data: queries.map(({ data: asset }) => asset).filter(Boolean),
    isFetching: queries.some(({ isFetching }) => isFetching),
  };
}
