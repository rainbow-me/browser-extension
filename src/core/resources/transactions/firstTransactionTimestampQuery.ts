import { useQuery } from '@tanstack/react-query';

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
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&page=1&offset=1&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  const parsedResponse = await response.json();
  const timestamp = parsedResponse.result[0]?.timeStamp;
  return timestamp ? timestamp * 1000 : undefined;
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
