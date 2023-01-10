import { useQuery } from '@tanstack/react-query';

import { refractionAddressWs } from '~/core/network';
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
import {
  chainIdFromChainName,
  chainNameFromChainId,
} from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';

const TRANSACTIONS_TIMEOUT_DURATION = 35000;
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
  const isMainnet = chainId === ChainId.mainnet;
  const scope = [
    `${isMainnet ? '' : chainNameFromChainId(chainId) + '-'}transactions`,
  ];
  const event = `received address ${scope[0]}`;
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency.toLowerCase(),
      transactions_limit: transactionsLimit ?? 250,
    },
    scope,
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(
        queryClient.getQueryData(
          transactionsQueryKey({
            address,
            chainId,
            currency,
            transactionsLimit,
          }),
        ) || [],
      );
    }, TRANSACTIONS_TIMEOUT_DURATION);
    const resolver = (message: TransactionsReceivedMessage) => {
      clearTimeout(timeout);
      resolve(parseTransactions(message, currency));
    };
    refractionAddressWs.once(event, resolver);
  });
}

type TransactionsResult = QueryFunctionResult<typeof transactionsQueryFunction>;

function parseTransactions(
  message: TransactionsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.transactions || [];
  const parsedTransactions = data
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        chainId: chainIdFromChainName(
          (message?.meta?.chain_id as ChainName) ?? ChainName.mainnet,
        ),
      }),
    )
    .flat();
  return parsedTransactions;
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
