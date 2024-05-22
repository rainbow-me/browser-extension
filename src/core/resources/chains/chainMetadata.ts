import { useQuery } from '@tanstack/react-query';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { getChainMetadataRPCUrl } from '~/core/utils/chains';
import { isValidUrl } from '~/core/utils/connectedApps';

// ///////////////////////////////////////////////
// Query Types

type ChainMetadataArgs = {
  rpcUrl?: string;
};

// ///////////////////////////////////////////////
// Query Key

export const chainMetadataQueryKey = ({ rpcUrl }: ChainMetadataArgs) =>
  createQueryKey('chainMetadata', { rpcUrl }, { persisterVersion: 1 });

type AssetMetadataQueryKey = ReturnType<typeof chainMetadataQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function chainMetadataQueryFunction({
  queryKey: [{ rpcUrl }],
}: QueryFunctionArgs<typeof chainMetadataQueryKey>) {
  if (rpcUrl && isValidUrl(rpcUrl)) {
    const metadata = await getChainMetadataRPCUrl({
      rpcUrl,
    });
    return {
      chainId: metadata?.chainId,
    };
  }
  return null;
}

type AssetMetadataResult = QueryFunctionResult<
  typeof chainMetadataQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useChainMetadata(
  { rpcUrl }: ChainMetadataArgs,
  config: QueryConfig<
    AssetMetadataResult,
    Error,
    AssetMetadataResult,
    AssetMetadataQueryKey
  > = {},
) {
  return useQuery({
    queryKey: chainMetadataQueryKey({
      rpcUrl,
    }),
    queryFn: chainMetadataQueryFunction,
    ...config,
  });
}
