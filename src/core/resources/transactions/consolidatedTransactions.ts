import { useInfiniteQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { platformHttp } from '~/core/network/platform';
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
import type { ListTransactionsResponse as PlatformListTransactionsResponse } from '~/core/types/gen/platform/transaction/transaction';
import {
  PaginatedTransactionsApiResponse,
  RainbowTransaction,
} from '~/core/types/transactions';
import { convertPlatformTransactionToPaginatedApiResponse } from '~/core/utils/platform';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const CONSOLIDATED_TRANSACTIONS_INTERVAL = 60000;
const CONSOLIDATED_TRANSACTIONS_TIMEOUT = 20000;
const PLATFORM_LIST_TRANSACTIONS_PATH = '/v1/transactions/ListTransactions';
const CONSOLIDATED_TRANSACTIONS_LIMIT = 100;

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
// Query Fetcher
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchConsolidatedTransactions<
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
    if (!address || chainIds.length === 0) {
      return { transactions: [] };
    }

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

    return {
      cutoff: undefined,
      nextPage: response?.data?.pagination?.cursor ?? undefined,
      transactions: consolidatedTransactions,
    };
  } catch (e) {
    // we don't bother with fetching cache and returning stale data here because we probably have previous page data already
    if (!(e instanceof Error && e.name === 'AbortError'))
      // abort errors are expected
      logger.error(
        new RainbowError('consolidatedTransactionsQueryFunction: '),
        {
          message: e,
        },
      );

    return { transactions: [] };
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
    refetchInterval: CONSOLIDATED_TRANSACTIONS_INTERVAL,
    retry: 3,
  });
}
