import { isValidAddress } from '@ethereumjs/util';
import { useQuery } from '@tanstack/react-query';
import { Address, getProvider } from '@wagmi/core';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { getAssetMetadata } from '~/core/utils/assets';

// ///////////////////////////////////////////////
// Query Types

type AssetMetadataArgs = {
  assetAddress?: Address;
  chainId: number;
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
    { persisterVersion: 1 },
  );

type AssetMetadataQueryKey = ReturnType<typeof assetMetadataQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function assetMetadataQueryFunction({
  queryKey: [{ assetAddress, chainId }],
}: QueryFunctionArgs<typeof assetMetadataQueryKey>) {
  if (assetAddress && isValidAddress(assetAddress)) {
    const provider = getProvider({ chainId: Number(chainId) });
    const metadata = await getAssetMetadata({
      address: assetAddress,
      provider,
    });
    return {
      address: assetAddress,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      name: metadata.name,
    };
  }
}

type AssetMetadataResult = QueryFunctionResult<
  typeof assetMetadataQueryFunction
>;

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
  return useQuery(
    assetMetadataQueryKey({
      assetAddress,
      chainId,
    }),
    assetMetadataQueryFunction,
    {
      ...config,
    },
  );
}
