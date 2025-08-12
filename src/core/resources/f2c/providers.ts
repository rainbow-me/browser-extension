import { useQuery } from '@tanstack/react-query';

import { f2cHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

import { ProviderConfig } from './types';

// ///////////////////////////////////////////////
// Query Types

// ///////////////////////////////////////////////
// Query Key

const providersListQueryKey = () =>
  createQueryKey('providersList', {}, { persisterVersion: 1 });

type ProvidersListQueryKey = ReturnType<typeof providersListQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function providersListQueryFunction() {
  const parsedResponse = await f2cHttp.get<{
    providers: ProviderConfig[];
  }>('/v1/providers/list');
  return parsedResponse.data?.providers ?? [];
}

type ProvidersListResult = QueryFunctionResult<
  typeof providersListQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchProvidersList(
  config: QueryConfig<
    ProvidersListResult,
    Error,
    ProvidersListResult,
    ProvidersListQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: providersListQueryKey(),
    queryFn: providersListQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useProvidersList(
  config: QueryConfig<
    ProvidersListResult,
    Error,
    ProvidersListResult,
    ProvidersListQueryKey
  > = {},
) {
  return useQuery({
    queryKey: providersListQueryKey(),
    queryFn: providersListQueryFunction,
    ...config,
  });
}
