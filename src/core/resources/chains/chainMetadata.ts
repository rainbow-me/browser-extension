import { JsonRpcProvider } from '@ethersproject/providers';
import { useQuery } from '@tanstack/react-query';

import { proxyRpcEndpoint } from '~/core/providers/proxy';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { isValidUrl } from '~/core/utils/connectedApps';

export const getChainMetadataRPCUrl = async ({
  rpcUrl,
}: {
  rpcUrl?: string;
}) => {
  if (rpcUrl && isValidUrl(rpcUrl)) {
    const provider = new JsonRpcProvider(proxyRpcEndpoint(rpcUrl, 0));
    const network = await provider.getNetwork();
    return { chainId: network.chainId };
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
