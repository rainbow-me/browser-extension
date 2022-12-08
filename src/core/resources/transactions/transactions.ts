import { useQuery } from '@tanstack/react-query';

import { refractionAddressMessages, refractionAddressWs } from '~/core/network';
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
import { chainIdFromChainName } from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';

const TRANSACTIONS_TIMEOUT_DURATION = 35000;
const TRANSACTIONS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type TransactionsArgs = {
  address?: string;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const transactionsQueryKey = ({ address, currency }: TransactionsArgs) =>
  createQueryKey(
    'transactions',
    { address, currency },
    { persisterVersion: 1 },
  );

type TransactionsQueryKey = ReturnType<typeof transactionsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function transactionsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof transactionsQueryKey>): Promise<
  RainbowTransaction[]
> {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency.toLowerCase(),
      transactions_limit: 250,
    },
    scope: ['transactions'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(
        queryClient.getQueryData(transactionsQueryKey({ address, currency })) ||
          [],
      );
    }, TRANSACTIONS_TIMEOUT_DURATION);
    const resolver = (message: TransactionsReceivedMessage) => {
      clearTimeout(timeout);
      resolve(parseTransactions(message, currency));
    };
    refractionAddressWs.once(
      refractionAddressMessages.ADDRESS_TRANSACTIONS.RECEIVED,
      resolver,
    );
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
  { address, currency }: TransactionsArgs,
  config: QueryConfig<
    TransactionsResult,
    Error,
    TSelectData,
    TransactionsQueryKey
  > = {},
) {
  return useQuery(
    transactionsQueryKey({ address, currency }),
    transactionsQueryFunction,
    {
      ...config,
      refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    },
  );
}
