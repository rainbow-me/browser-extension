import { useQuery } from '@tanstack/react-query';

import { metadataStagingClient } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type BackendChainsArgs = {
  hash: string;
};

// ///////////////////////////////////////////////
// Query Key

const backendChainsQueryKey = ({ hash }: BackendChainsArgs) =>
  createQueryKey('backendChains', { hash }, { persisterVersion: 1 });

type BackendChainsQueryKey = ReturnType<typeof backendChainsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function backendChainsQueryFunction() {
  const networks = metadataStagingClient.getNetworks();
  return networks;
}

type BackendChainsResult = QueryFunctionResult<
  typeof backendChainsQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher (Optional)

export async function fetchBackendChains(
  { hash }: BackendChainsArgs,
  config: QueryConfig<
    BackendChainsResult,
    Error,
    BackendChainsResult,
    BackendChainsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: backendChainsQueryKey({ hash }),
    queryFn: backendChainsQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useBackendChains(
  { hash }: BackendChainsArgs,
  config: QueryConfig<
    BackendChainsResult,
    Error,
    BackendChainsResult,
    BackendChainsQueryKey
  > = {},
) {
  return useQuery({
    queryKey: backendChainsQueryKey({ hash }),
    queryFn: backendChainsQueryFunction,
    ...config,
  });
}
