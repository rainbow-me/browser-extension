import { useQuery } from '@tanstack/react-query';

import { addysHttpV3 } from '~/core/network/addys';
import {
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

const TRANSACTIONS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type ConsolidatedTransactionsArgs = {
  address?: string;
  currency: SupportedCurrencyKey;
  cursor?: string;
  transactionsLimit?: number;
};

// ///////////////////////////////////////////////
// Query Key

export const consolidatedTransactionsQueryKey = ({
  address,
  currency,
  cursor,
  transactionsLimit,
}: ConsolidatedTransactionsArgs) =>
  createQueryKey(
    'consolidatedTransactions',
    { address, currency, cursor, transactionsLimit },
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
  {
    address,
    currency,
    cursor,
    transactionsLimit,
  }: ConsolidatedTransactionsArgs,
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
      cursor,
      transactionsLimit,
    }),
    consolidatedTransactionsQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

async function consolidatedTransactionsQueryFunction({
  queryKey: [{ address, currency, transactionsLimit }],
}: QueryFunctionArgs<typeof consolidatedTransactionsQueryKey>): Promise<
  RainbowTransaction[]
> {
  try {
    const response = await addysHttpV3.get<TransactionsReceivedMessage>(
      `/${SUPPORTED_CHAIN_IDS.join(',')}/${address}/transactions`,
      {
        params: {
          currency: currency.toLowerCase(),
          limit: transactionsLimit?.toString() || '100',
        },
      },
    );
    console.log('RESPONSE: ', response);
    return parseConsolidatedTransactions(response?.data, currency);
  } catch (e) {
    const cache = queryClient.getQueryCache();
    const cachedConsolidatedTransactions = cache.find(
      consolidatedTransactionsQueryKey({
        address,
        currency,
        transactionsLimit,
      }),
    )?.state?.data as RainbowTransaction[];
    logger.error(new RainbowError('consolidatedTransactionsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return cachedConsolidatedTransactions;
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

export function useConsolidatedTransactions<
  TSelectData = ConsolidatedTransactionsResult,
>(
  {
    address,
    currency,
    cursor,
    transactionsLimit,
  }: ConsolidatedTransactionsArgs,
  config: QueryConfig<
    ConsolidatedTransactionsResult,
    Error,
    TSelectData,
    ConsolidatedTransactionsQueryKey
  > = {},
) {
  return useQuery(
    consolidatedTransactionsQueryKey({
      address,
      currency,
      cursor,
      transactionsLimit,
    }),
    consolidatedTransactionsQueryFunction,
    {
      ...config,
      refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    },
  );
}
