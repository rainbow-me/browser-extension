import { useInfiniteQuery } from '@tanstack/react-query';

import { addysHttp } from '~/core/network/addys';
import {
  InfiniteQueryConfig,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainName } from '~/core/types/chains';
import { TransactionsReceivedMessage } from '~/core/types/refraction';
import { RainbowTransaction } from '~/core/types/transactions';
import {
  chainIdFromChainName,
  getSupportedChainIds,
  getSupportedTestnetChainIds,
  isCustomChain,
} from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const CONSOLIDATED_TRANSACTIONS_INTERVAL = 60000;
const CONSOLIDATED_TRANSACTIONS_TIMEOUT = 20000;

// ///////////////////////////////////////////////
// Query Types

export type ConsolidatedTransactionsArgs = {
  address: string;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
};

// ///////////////////////////////////////////////
// Query Key

export const consolidatedTransactionsQueryKey = ({
  address,
  currency,
  testnetMode,
}: ConsolidatedTransactionsArgs) =>
  createQueryKey(
    'consolidatedTransactions',
    { address, currency, testnetMode },
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
  { address, currency, testnetMode }: ConsolidatedTransactionsArgs,
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
      testnetMode,
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

export async function consolidatedTransactionsQueryFunction({
  queryKey: [{ address, currency, testnetMode }],
  pageParam,
}: QueryFunctionArgs<
  typeof consolidatedTransactionsQueryKey
>): Promise<_QueryResult> {
  try {
    const supportedChainIds = testnetMode
      ? getSupportedTestnetChainIds()
      : getSupportedChainIds().filter((chainId) => !isCustomChain(chainId));
    const response = await addysHttp.get<TransactionsReceivedMessage>(
      `/${supportedChainIds.join(',')}/${address}/transactions`,
      {
        params: {
          currency: currency.toLowerCase(),
          // passing empty value to pageParam breaks request
          ...(pageParam ? { pageCursor: pageParam } : {}),
        },
        timeout: CONSOLIDATED_TRANSACTIONS_TIMEOUT,
      },
    );
    const consolidatedTransactions = await parseConsolidatedTransactions(
      response?.data,
      currency,
    );

    return {
      cutoff: response?.data?.meta?.cut_off,
      nextPage: response?.data?.meta?.next_page_cursor,
      transactions: consolidatedTransactions,
    };
  } catch (e) {
    // we don't bother with fetching cache and returning stale data here because we probably have previous page data already
    logger.error(new RainbowError('consolidatedTransactionsQueryFunction: '), {
      message: e,
    });
    return { transactions: [] };
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
  const parsedTransactionPromises = data
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        chainId: chainIdFromChainName(tx?.network ?? ChainName.mainnet),
      }),
    )
    .filter(Boolean);

  const parsedConsolidatedTransactions = (
    await Promise.all(parsedTransactionPromises)
  ).flat();
  return parsedConsolidatedTransactions;
}

// ///////////////////////////////////////////////
// Query Hook

export function useConsolidatedTransactions<
  TSelectData = ConsolidatedTransactionsResult,
>(
  { address, currency }: ConsolidatedTransactionsArgs,
  config: InfiniteQueryConfig<
    ConsolidatedTransactionsResult,
    Error,
    TSelectData
  > = {},
) {
  const { testnetMode } = useTestnetModeStore();
  return useInfiniteQuery(
    consolidatedTransactionsQueryKey({
      address,
      currency,
      testnetMode,
    }),
    consolidatedTransactionsQueryFunction,
    {
      ...config,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: CONSOLIDATED_TRANSACTIONS_INTERVAL,
      retry: 3,
    },
  );
}
