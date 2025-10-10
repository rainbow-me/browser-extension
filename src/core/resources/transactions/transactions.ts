import { useQuery } from '@tanstack/react-query';

import { platformHttp } from '~/core/network/platform';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import type {
  ListTransactionsResponse as PlatformListTransactionsResponse,
  Transaction as PlatformTransaction,
} from '~/core/types/gen/plattform/transaction/transaction';
import { RainbowTransaction } from '~/core/types/transactions';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const TRANSACTIONS_REFETCH_INTERVAL = 60000;
const PLATFORM_LIST_TRANSACTIONS_PATH = '/v1/transactions/ListTransactions';

// ///////////////////////////////////////////////
// Query Types

export type TransactionsArgs = {
  address?: string;
  chainId: ChainId;
  currency: SupportedCurrencyKey;
  transactionsLimit?: number;
};

// ///////////////////////////////////////////////
// Query Key

export const transactionsQueryKey = ({
  address,
  chainId,
  currency,
  transactionsLimit,
}: TransactionsArgs) =>
  createQueryKey(
    'transactions',
    { address, chainId, currency, transactionsLimit },
    { persisterVersion: 1 },
  );

type TransactionsQueryKey = ReturnType<typeof transactionsQueryKey>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchTransactions<TSelectData = TransactionsResult>(
  { address, chainId, currency, transactionsLimit }: TransactionsArgs,
  config: QueryConfig<
    TransactionsResult,
    Error,
    TSelectData,
    TransactionsQueryKey
  >,
) {
  return await queryClient.fetchQuery({
    queryKey: transactionsQueryKey({
      address,
      chainId,
      currency,
      transactionsLimit,
    }),
    queryFn: transactionsQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Function

async function transactionsQueryFunction({
  queryKey: [{ address, chainId, currency, transactionsLimit }],
}: QueryFunctionArgs<typeof transactionsQueryKey>): Promise<
  RainbowTransaction[]
> {
  try {
    if (!address) {
      return [];
    }

    const params: Record<string, string> = {
      address,
      currency: currency.toLowerCase(),
      chainIds: chainId.toString(),
      limit: transactionsLimit?.toString() || '100',
    };

    const response = await platformHttp.get<PlatformListTransactionsResponse>(
      PLATFORM_LIST_TRANSACTIONS_PATH,
      {
        params,
        timeout: 30000,
      },
    );

    const transactions = response?.data?.result ?? [];

    return parseTransactions(transactions, currency, chainId);
  } catch (e) {
    const cache = queryClient.getQueryCache();
    const cachedTransactions = cache.find({
      queryKey: transactionsQueryKey({
        address,
        chainId,
        currency,
        transactionsLimit,
      }),
    })?.state?.data as RainbowTransaction[];
    logger.error(new RainbowError('transactionsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return cachedTransactions;
  }
}

type TransactionsResult = QueryFunctionResult<typeof transactionsQueryFunction>;

async function parseTransactions(
  transactions: PlatformTransaction[],
  currency: SupportedCurrencyKey,
  chainId: ChainId,
) {
  return transactions
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        chainId,
      }),
    )
    .filter(Boolean);
}

// ///////////////////////////////////////////////
// Query Hook

export function useTransactions<TSelectData = TransactionsResult>(
  { address, chainId, currency, transactionsLimit }: TransactionsArgs,
  config: QueryConfig<
    TransactionsResult,
    Error,
    TSelectData,
    TransactionsQueryKey
  > = {},
) {
  return useQuery({
    queryKey: transactionsQueryKey({
      address,
      currency,
      chainId,
      transactionsLimit,
    }),
    queryFn: transactionsQueryFunction,
    ...config,
    refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
  });
}
