import { useQuery } from '@tanstack/react-query';

import { etherscanHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type FirstTransactionTimestampArgs = {
  address?: string;
};

// ///////////////////////////////////////////////
// Query Key

const firstTransactionTimestampQueryKey = ({
  address,
}: FirstTransactionTimestampArgs) =>
  createQueryKey(
    'firstTransactionTimestamp',
    { address },
    { persisterVersion: 1 },
  );

type FirstTransactionTimestampQueryKey = ReturnType<
  typeof firstTransactionTimestampQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function firstTransactionTimestampQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof firstTransactionTimestampQueryKey>) {
  if (!address) return undefined;
  const parsedResponse = await etherscanHttp.get<{
    result: { timeStamp: number }[];
  }>('/', {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      sort: 'asc',
    },
  });
  const timestamp = parsedResponse.data?.result[0]?.timeStamp;
  return timestamp ? timestamp * 1000 : null;
}

type FirstTransactionTimestampResult = QueryFunctionResult<
  typeof firstTransactionTimestampQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchFirstTransactionTimestamp(
  { address }: FirstTransactionTimestampArgs,
  config: QueryConfig<
    FirstTransactionTimestampResult,
    Error,
    FirstTransactionTimestampResult,
    FirstTransactionTimestampQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: firstTransactionTimestampQueryKey({ address }),
    queryFn: firstTransactionTimestampQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useFirstTransactionTimestamp(
  { address }: FirstTransactionTimestampArgs,
  config: QueryConfig<
    FirstTransactionTimestampResult,
    Error,
    FirstTransactionTimestampResult,
    FirstTransactionTimestampQueryKey
  > = {},
) {
  return useQuery({
    queryKey: firstTransactionTimestampQueryKey({ address }),
    queryFn: firstTransactionTimestampQueryFunction,
    ...config,
  });
}
