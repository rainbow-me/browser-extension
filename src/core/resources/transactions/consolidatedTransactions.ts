import { useInfiniteQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { platformHttp } from '~/core/network/platform';
import {
  InfiniteQueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainName, chainNameToIdMapping } from '~/core/types/chains';
import type { ListTransactionsResponse as PlatformListTransactionsResponse } from '~/core/types/gen/platform/transaction/transaction';
import {
  PaginatedTransactionsApiResponse,
  RainbowTransaction,
} from '~/core/types/transactions';
import { convertPlatformTransactionToPaginatedApiResponse } from '~/core/utils/platform';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const CONSOLIDATED_TRANSACTIONS_TIMEOUT = 20000;
const PLATFORM_LIST_TRANSACTIONS_PATH = '/transactions/ListTransactions';
const CONSOLIDATED_TRANSACTIONS_LIMIT = 100;
const CONSOLIDATED_TRANSACTIONS_STALE_TIME = /** 1 day */ 24 * 60 * 60 * 1000; // will be refetched explicitly when new tx is detected

// ///////////////////////////////////////////////
// Query Types

type ConsolidatedTransactionsArgs = {
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
  const supportedTransactionsChainIds = useNetworkStore
    .getState()
    .getSupportedTransactionsChainIds();
  const chainIds = userChainIds.filter((id) =>
    supportedTransactionsChainIds.includes(id),
  );
  if (!address || chainIds.length === 0) {
    return { transactions: [] };
  }

  try {
    const params: Record<string, string> = {
      address,
      currency: currency.toLowerCase(),
      chainIds: chainIds.join(','),
      limit: CONSOLIDATED_TRANSACTIONS_LIMIT.toString(),
    };

    if (typeof pageParam === 'string') {
      params.cursor = pageParam;
    }

    const response = await platformHttp.get<PlatformListTransactionsResponse>(
      PLATFORM_LIST_TRANSACTIONS_PATH,
      {
        params,
        timeout: CONSOLIDATED_TRANSACTIONS_TIMEOUT,
      },
    );

    const paginatedTransactions = (response?.data?.result ?? []).map((tx) =>
      convertPlatformTransactionToPaginatedApiResponse(tx),
    );

    const consolidatedTransactions = await parseConsolidatedTransactions(
      paginatedTransactions,
      currency,
    );

    const noResults = consolidatedTransactions.length === 0;

    // Calculate cutoff from the oldest transaction timestamp
    // This prevents custom network transactions from being duplicated when paginating
    const cutoff = noResults
      ? undefined
      : Math.min(
          ...consolidatedTransactions
            .filter((tx) => tx.status !== 'pending')
            .map((tx) =>
              'minedAt' in tx && tx.minedAt ? tx.minedAt : Infinity,
            ),
        );

    const nextCursor = response?.data?.pagination?.cursor;

    // Stop pagination if:
    const shouldStopPagination =
      !nextCursor || // If no next cursor is returned, stop pagination
      noResults || // If no transactions are returned, stop pagination
      (typeof pageParam === 'string' && pageParam === nextCursor); // If the cursor hasn't changed, stop pagination

    return {
      cutoff: cutoff === Infinity ? undefined : cutoff,
      nextPage: shouldStopPagination ? undefined : nextCursor,
      transactions: consolidatedTransactions,
    };
  } catch (e) {
    // Abort errors are expected and should not be logged or thrown
    if (e instanceof Error && e.name === 'AbortError') {
      throw e; // Re-throw abort errors so React Query handles them properly
    }

    // For other errors, log and throw so React Query preserves previous data via placeholderData
    logger.error(new RainbowError('consolidatedTransactionsQueryFunction: '), {
      message: e,
    });

    // Throw the error so React Query treats it as a failure and preserves previous data
    throw e;
  }
}

type ConsolidatedTransactionsResult = QueryFunctionResult<
  typeof consolidatedTransactionsQueryFunction
>;

async function parseConsolidatedTransactions(
  transactions: PaginatedTransactionsApiResponse[],
  currency: SupportedCurrencyKey,
) {
  return transactions
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
    TSelectData,
    ConsolidatedTransactionsQueryKey,
    string | null
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
    initialPageParam: null as string | null,
    staleTime: CONSOLIDATED_TRANSACTIONS_STALE_TIME,
    retry: 3,
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache for a day
    placeholderData: (previousData) => previousData, // Preserve previous data on error
  });
}
