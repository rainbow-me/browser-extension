import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { addysHttp } from '~/core/network/addys';
import { QueryFunctionResult, createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  consolidatedTransactionsQueryFunction,
  consolidatedTransactionsQueryKey,
} from '~/core/resources/transactions/consolidatedTransactions';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { TransactionApiResponse } from '~/core/types/transactions';
import { parseTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

type ConsolidatedTransactionsResult = QueryFunctionResult<
  typeof consolidatedTransactionsQueryFunction
>;

const fetchTransaction = async ({
  hash,
  address,
  currency,
  chainId,
}: {
  hash: `0x${string}`;
  address: Address;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
}) => {
  try {
    const tx = await addysHttp
      .get<{
        payload: { transaction: TransactionApiResponse };
      }>(`/${chainId}/${address}/transactions/${hash}`, {
        params: { currency: currency.toLowerCase() },
      })
      .then((r) => r.data.payload.transaction);
    return parseTransaction({ tx, currency, chainId });
  } catch (e) {
    logger.error(new RainbowError('fetchTransaction: '), {
      message: (e as Error)?.message,
    });
  }
};

type PaginatedTransactions = { pages: ConsolidatedTransactionsResult[] };

export function useTransaction({
  hash,
  chainId,
}: {
  hash?: `0x${string}`;
  chainId: ChainId;
}) {
  const queryClient = useQueryClient();
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();

  const paginatedTransactionsKey = consolidatedTransactionsQueryKey({
    address,
    currency,
  });

  const params = {
    hash: hash!,
    address,
    currency,
    chainId,
  };

  return useQuery({
    queryKey: createQueryKey('transaction', params),
    queryFn: () => fetchTransaction(params),
    enabled: !!hash,
    initialData: () => {
      const queryData = queryClient.getQueryData<PaginatedTransactions>(
        paginatedTransactionsKey,
      );
      const pages = queryData?.pages || [];
      for (const page of pages) {
        const tx = page.transactions.find((tx) => tx.hash === hash);
        if (tx) return tx;
      }
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(paginatedTransactionsKey)?.dataUpdatedAt,
  });
}
