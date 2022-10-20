import { useQuery } from '@tanstack/react-query';
import { etherscanHttp } from '~/core/network';

import {
  createQueryKey,
  queryClient,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
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
  const parsedResponse = await etherscanHttp.get('/', {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      sort: 'asc',
    },
  });
  const timestamp = parsedResponse.data.result[0]?.timeStamp;
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
    FirstTransactionTimestampQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    firstTransactionTimestampQueryKey({ address }),
    firstTransactionTimestampQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useFirstTransactionTimestamp(
  { address }: FirstTransactionTimestampArgs,
  config: QueryConfig<
    FirstTransactionTimestampResult,
    Error,
    FirstTransactionTimestampQueryKey
  > = {},
) {
  return useQuery(
    firstTransactionTimestampQueryKey({ address }),
    firstTransactionTimestampQueryFunction,
    config,
  );
}
