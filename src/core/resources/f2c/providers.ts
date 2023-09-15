import { useQuery } from '@tanstack/react-query';

import { f2cHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ProviderConfig } from './types';

// ///////////////////////////////////////////////
// Query Types

export type ProvidersListArgs = {};

// ///////////////////////////////////////////////
// Query Key

const providersListQueryKey = () =>
  createQueryKey('providersList', {}, { persisterVersion: 1 });

type ProvidersListQueryKey = ReturnType<typeof providersListQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function providersListQueryFunction({
  queryKey: [],
}: QueryFunctionArgs<typeof providersListQueryKey>) {
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

export async function fetchProvidersList(
  {}: ProvidersListArgs,
  config: QueryConfig<
    ProvidersListResult,
    Error,
    ProvidersListResult,
    ProvidersListQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    providersListQueryKey(),
    providersListQueryFunction,
    config,
  );
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
  return useQuery(providersListQueryKey(), providersListQueryFunction, config);
}
