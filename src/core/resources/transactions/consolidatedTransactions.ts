import { useInfiniteQuery } from '@tanstack/react-query';
import { Address } from 'viem';

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
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { TransactionsReceivedMessage } from '~/core/types/zerion';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const CONSOLIDATED_TRANSACTIONS_INTERVAL = 60000;
const CONSOLIDATED_TRANSACTIONS_TIMEOUT = 20000;

// ///////////////////////////////////////////////
// Query Types

export type ConsolidatedTransactionsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  userChainIds: number[];
};

// ///////////////////////////////////////////////
// Query Key

export const consolidatedTransactionsQueryKey = ({
  address,
  currency,
  userChainIds,
}: ConsolidatedTransactionsArgs) =>
  createQueryKey(
    'consolidatedTransactions',
    { address, currency, userChainIds },
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
  { address, currency, userChainIds }: ConsolidatedTransactionsArgs,
  config: QueryConfig<
    ConsolidatedTransactionsResult,
    Error,
    TSelectData,
    ConsolidatedTransactionsQueryKey
  >,
) {
  return await queryClient.fetchQuery({
    queryKey: consolidatedTransactionsQueryKey({
      address,
      currency,
      userChainIds,
    }),
    queryFn: consolidatedTransactionsQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Function

type _QueryResult = {
  cutoff?: number;
  nextPage?: string;
  pages?: { cutoff: number; transactions: RainbowTransaction[] }[];
  transactions: RainbowTransaction[];
};

export async function consolidatedTransactionsQueryFunction({
  queryKey: [{ address, currency, userChainIds }],
  pageParam,
}: QueryFunctionArgs<
  typeof consolidatedTransactionsQueryKey
>): Promise<_QueryResult> {
  try {
    const supportedTransactionsChainIds = useNetworkStore
      .getState()
      .getSupportedTransactionsChainIds();
    const chainIds = userChainIds.filter((id) =>
      supportedTransactionsChainIds.includes(id),
    );
    const response = await addysHttp.get<TransactionsReceivedMessage>(
      `/${chainIds.join(',')}/${address}/transactions`,
      {
        params: {
          currency: currency.toLowerCase(),
          // passing empty value to pageParam breaks request
          ...(pageParam ? { pageCursor: pageParam as string } : {}),
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
  return data
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        chainId: chainNameToIdMapping[tx?.network ?? ChainName.mainnet],
      }),
    )
    .filter(Boolean);
}

// ///////////////////////////////////////////////
// Query Hook

export function useConsolidatedTransactions<
  TSelectData = ConsolidatedTransactionsResult,
>(
  { address, currency, userChainIds }: ConsolidatedTransactionsArgs,
  config: InfiniteQueryConfig<
    ConsolidatedTransactionsResult,
    Error,
    TSelectData
  > = {},
) {
  return useInfiniteQuery({
    queryKey: consolidatedTransactionsQueryKey({
      address,
      currency,
      userChainIds,
    }),
    queryFn: consolidatedTransactionsQueryFunction,
    ...config,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    initialPageParam: null,
    refetchInterval: CONSOLIDATED_TRANSACTIONS_INTERVAL,
    retry: 3,
  });
}
