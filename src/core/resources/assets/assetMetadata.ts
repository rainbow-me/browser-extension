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

const assetMetadataQueryKey = ({ assetAddress, chainId }: AssetMetadataArgs) =>
  createQueryKey(
    'assetMetadata',
    { assetAddress, chainId },
    { persisterVersion: 1 },
  );

type AssetMetadataQueryKey = ReturnType<typeof assetMetadataQueryKey>;

const assetSearchMetadataQueryKey = ({
  assetAddress,
  chainId,
}: AssetMetadataArgs) =>
  createQueryKey(
    'assetSearchMetadata',
    { assetAddress, chainId },
    { persisterVersion: 1 },
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
  if (assetAddress && isAddress(assetAddress)) {
    const metadata = await getAssetMetadata({
      address: assetAddress,
      chainId: Number(chainId),
    });

    const { decimals, symbol, name } = metadata || {};

    if (decimals && symbol && name) {
      return parseSearchAssetMetadata({
        address: assetAddress,
        decimals,
        symbol,
        name,
        chainId,
      });
    }
  }

  return null;
}

type AssetMetadataResult = QueryFunctionResult<
  typeof assetMetadataQueryFunction
>;

type AssetSearchMetadataResult = QueryFunctionResult<
  typeof assetSearchMetadataQueryFunction
>;

function parseSearchAssetMetadata({
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
      ...config,
    })),
  });

  return {
    data: queries.map(({ data: asset }) => asset).filter(Boolean),
    isFetching: queries.some(({ isFetching }) => isFetching),
  };
}
