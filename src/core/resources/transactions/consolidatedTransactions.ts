import { useInfiniteQuery } from '@tanstack/react-query';

import { addysHttpV3 } from '~/core/network/addys';
import {
  InfiniteQueryConfig,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainName } from '~/core/types/chains';
import { TransactionsReceivedMessage } from '~/core/types/refraction';
import { RainbowTransaction } from '~/core/types/transactions';
import { SUPPORTED_CHAIN_IDS, chainIdFromChainName } from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const CONSOLIDATED_TRANSACTIONS_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type ConsolidatedTransactionsArgs = {
  address?: string;
  currency: SupportedCurrencyKey;
  transactionsLimit?: number;
};

// ///////////////////////////////////////////////
// Query Key

export const consolidatedTransactionsQueryKey = ({
  address,
  currency,
  transactionsLimit,
}: ConsolidatedTransactionsArgs) =>
  createQueryKey(
    'consolidatedTransactions',
    { address, currency, transactionsLimit },
    { persisterVersion: 1 },
  );

type ConsolidatedTransactionsQueryKey = ReturnType<
  typeof consolidatedTransactionsQueryKey
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchConsolidatedTransactions<
  TSelectData = ConsolidatedTransactionsResult,
>(
  { address, currency, transactionsLimit }: ConsolidatedTransactionsArgs,
  config: QueryConfig<
    ConsolidatedTransactionsResult,
    Error,
    TSelectData,
    ConsolidatedTransactionsQueryKey
  >,
) {
  return await queryClient.fetchQuery(
    consolidatedTransactionsQueryKey({
      address,
      currency,
      transactionsLimit,
    }),
    consolidatedTransactionsQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

type _QueryResult = {
  cutoff?: number;
  nextPage?: string;
  transactions: RainbowTransaction[];
};

async function consolidatedTransactionsQueryFunction({
  queryKey: [{ address, currency, transactionsLimit }],
  pageParam,
}: QueryFunctionArgs<
  typeof consolidatedTransactionsQueryKey
>): Promise<_QueryResult> {
  try {
    const response = await addysHttpV3.get<TransactionsReceivedMessage>(
      `/${SUPPORTED_CHAIN_IDS.join(',')}/${address}/transactions`,
      {
        params: {
          currency: currency.toLowerCase(),
          limit: transactionsLimit?.toString() || '100',
          // passing empty value to pageParam breaks request
          ...(pageParam ? { pageCursor: pageParam } : {}),
        },
      },
    );
    return {
      cutoff: response?.data?.meta?.cutoff,
      nextPage: response?.data?.meta?.next_page_cursor,
      transactions: await parseConsolidatedTransactions(
        response?.data,
        currency,
      ),
    };
  } catch (e) {
    const cache = queryClient.getQueryCache();
    const cachedConsolidatedTransactions = cache.find(
      consolidatedTransactionsQueryKey({
        address,
        currency,
        transactionsLimit,
      }),
    )?.state?.data as _QueryResult;
    logger.error(new RainbowError('consolidatedTransactionsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return cachedConsolidatedTransactions || { transactions: [] };
  }
}

type ConsolidatedTransactionsResult = QueryFunctionResult<
  typeof consolidatedTransactionsQueryFunction
>;

async function parseConsolidatedTransactions(
  message: TransactionsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.transactions || [];
  const parsedTransactionPromises = data.map((tx) =>
    parseTransaction({
      tx,
      currency,
      chainId: chainIdFromChainName(
        (message?.meta?.chain_id as ChainName) ?? ChainName.mainnet,
      ),
    }),
  );

  const parsedConsolidatedTransactions = (
    await Promise.all(parsedTransactionPromises)
  ).flat();
  return parsedConsolidatedTransactions;
}

// ///////////////////////////////////////////////
// Query Hook

export function useConsolidatedTransactions(
  { address, currency, transactionsLimit }: ConsolidatedTransactionsArgs,
  config: InfiniteQueryConfig<ConsolidatedTransactionsResult, Error> = {},
) {
  return useInfiniteQuery(
    consolidatedTransactionsQueryKey({
      address,
      currency,
      transactionsLimit,
    }),
    consolidatedTransactionsQueryFunction,
    {
      ...config,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: CONSOLIDATED_TRANSACTIONS_INTERVAL,
    },
  );
}
