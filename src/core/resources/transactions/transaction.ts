import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Hash, getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
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
import {
  MinedTransaction,
  PendingTransaction,
  TransactionApiResponse,
  TxHash,
} from '~/core/types/transactions';
import { isCustomChain } from '~/core/utils/chains';
import { parseTransaction } from '~/core/utils/transactions';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { RainbowError, logger } from '~/logger';

type ConsolidatedTransactionsResult = QueryFunctionResult<
  typeof consolidatedTransactionsQueryFunction
>;

export const fetchTransaction = async ({
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

export function useBackendTransaction({
  hash,
  chainId,
  enabled,
}: {
  hash: TxHash;
  chainId: ChainId;
  enabled: boolean;
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
    enabled: !!hash && !!address && !!chainId && enabled,
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

const getCustomChainTransaction = async ({
  chainId,
  hash,
}: {
  chainId: number;
  hash: Hash;
}) => {
  const provider = getProvider({ chainId });
  const transaction = await provider.getTransaction(hash);
  if (!transaction) return undefined;

  const block = transaction?.blockHash
    ? await provider.getBlock(transaction?.blockHash)
    : undefined;

  const parsedTransaction = transaction.blockNumber
    ? ({
        status: 'confirmed',
        blockNumber: transaction.blockNumber || 0,
        minedAt: block?.timestamp || 0,
        confirmations: transaction.confirmations,
        gasUsed: transaction.gasLimit.toString(),
        hash: transaction.hash as Hash,
        nonce: transaction.nonce,
        chainId: transaction.chainId,
        from: transaction.from as Address,
        to: transaction.to as Address,
        data: transaction.data,
        value: transaction.value.toString(),
        type: 'send',
        title: i18n.t('transactions.send.confirmed'),
        baseFee: block?.baseFeePerGas?.toString(),
        maxFeePerGas: transaction.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
        gasPrice: transaction.gasPrice?.toString(),
      } satisfies MinedTransaction)
    : ({
        status: 'pending',
        hash: transaction.hash as Hash,
        nonce: transaction.nonce,
        chainId: transaction.chainId,
        from: transaction.from as Address,
        to: transaction.to as Address,
        data: transaction.data,
        value: transaction.value.toString(),
        type: 'send',
        title: i18n.t('transactions.send.pending'),
      } satisfies PendingTransaction);
  return parsedTransaction;
};

export function useCustomNetworkTransaction({
  hash,
  chainId,
  enabled,
}: {
  hash: TxHash;
  chainId: ChainId;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: createQueryKey('providerTransaction', { chainId, hash }),
    queryFn: () => getCustomChainTransaction({ chainId, hash }),
    enabled: !!hash && !!chainId && enabled,
  });
}

export const useTransaction = ({
  chainId,
  hash,
}: {
  chainId: number;
  hash: `0x${string}`;
}) => {
  const customChain = isCustomChain(chainId);
  const {
    data: backendTransaction,
    isLoading: backendTransactionIsLoading,
    isFetched: backendTransactionIsFetched,
  } = useBackendTransaction({
    hash,
    chainId,
    enabled: !customChain,
  });
  const {
    data: providerTransaction,
    isLoading: providerTransactionIsLoading,
    isFetched: providerTransactionIsFetched,
  } = useCustomNetworkTransaction({
    hash,
    chainId,
    enabled: customChain,
  });
  return {
    data: customChain ? providerTransaction : backendTransaction,
    isLoading: customChain
      ? providerTransactionIsLoading
      : backendTransactionIsLoading,
    isFetched: customChain
      ? providerTransactionIsFetched
      : backendTransactionIsFetched,
  };
};
