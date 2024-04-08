import { useQuery } from '@tanstack/react-query';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId, ChainName } from '~/core/types/chains';
import { TransactionsReceivedMessage } from '~/core/types/refraction';
import { RainbowTransaction } from '~/core/types/transactions';
import { chainIdFromChainName } from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

const TRANSACTIONS_REFETCH_INTERVAL = 60000;

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
  return await queryClient.fetchQuery(
    transactionsQueryKey({ address, chainId, currency, transactionsLimit }),
    transactionsQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

async function transactionsQueryFunction({
  queryKey: [{ address, chainId, currency, transactionsLimit }],
}: QueryFunctionArgs<typeof transactionsQueryKey>): Promise<
  RainbowTransaction[]
> {
  try {
    const response = await addysHttp.get<TransactionsReceivedMessage>(
      `/${chainId}/${address}/transactions`,
      {
        params: {
          currency: currency.toLowerCase(),
          limit: transactionsLimit?.toString() || '100',
        },
        timeout: 30000,
      },
    );
    return parseTransactions(response?.data, currency);
  } catch (e) {
    const cache = queryClient.getQueryCache();
    const cachedTransactions = cache.find(
      transactionsQueryKey({ address, chainId, currency, transactionsLimit }),
    )?.state?.data as RainbowTransaction[];
    logger.error(new RainbowError('transactionsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return cachedTransactions;
  }
}

type TransactionsResult = QueryFunctionResult<typeof transactionsQueryFunction>;

async function parseTransactions(
  message: TransactionsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.transactions || [];
  return data
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        chainId: chainIdFromChainName(
          (message?.meta?.chain_id as ChainName) ?? ChainName.mainnet,
        ),
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
  return useQuery(
    transactionsQueryKey({ address, currency, chainId, transactionsLimit }),
    transactionsQueryFunction,
    {
      ...config,
      refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    },
  );
}
