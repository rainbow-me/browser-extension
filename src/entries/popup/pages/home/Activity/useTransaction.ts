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
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId } from '~/core/types/chains';
import { TransactionApiResponse, TxHash } from '~/core/types/transactions';
import { parseTransaction } from '~/core/utils/transactions';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
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
  hash: TxHash;
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
    const parsedTx = parseTransaction({ tx, currency, chainId });
    if (!parsedTx) throw new Error('Failed to parse transaction');
    return parsedTx;
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
  hash?: TxHash;
  chainId: ChainId;
}) {
  const queryClient = useQueryClient();
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { testnetMode } = useTestnetModeStore();
  const { chains } = useUserChains();

  const paginatedTransactionsKey = consolidatedTransactionsQueryKey({
    address,
    currency,
    testnetMode,
    userChainIds: chains.map((chain) => chain.id),
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
    enabled: !!hash && !!address && !!chainId,
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
