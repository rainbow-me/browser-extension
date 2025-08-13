import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';

import { proxyRpcEndpoint } from '~/core/providers/proxy';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { isValidUrl } from '~/core/utils/connectedApps';

const getChainMetadataRPCUrl = async ({
  rpcUrl,
}: {
  rpcUrl?: string;
}): Promise<{ chainId: number } | null> => {
  if (rpcUrl && isValidUrl(rpcUrl)) {
    // viem expects the url to be a string, proxyRpcEndpoint can be used as before
    const client = createPublicClient({
      transport: http(proxyRpcEndpoint(rpcUrl, 0)),
    });
    // getChainId returns a Promise<number>
    const chainId = await client.getChainId();
    return { chainId };
  }
  return null;
};

// ///////////////////////////////////////////////
// Query Types

type ChainMetadataArgs = {
  rpcUrl?: string;
};

// ///////////////////////////////////////////////
// Query Key

const chainMetadataQueryKey = ({ rpcUrl }: ChainMetadataArgs) =>
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
