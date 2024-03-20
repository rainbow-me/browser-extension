import { formatUnits } from '@ethersproject/units';
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
import {
  pendingTransactionsStore,
  useCurrentAddressStore,
  useCurrentCurrencyStore,
} from '~/core/state';
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

const searchInLocalPendingTransactions = (userAddress: Address, hash: Hash) => {
  const { pendingTransactions } = pendingTransactionsStore.getState();
  const localPendingTx = pendingTransactions[userAddress]?.find(
    (tx) => tx.hash === hash,
  );
  return localPendingTx;
};

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
    const response = await addysHttp.get<{
      payload: { transaction: TransactionApiResponse };
      meta: { status: string };
    }>(`/${chainId}/${address}/transactions/${hash}`, {
      params: { currency: currency.toLowerCase() },
    });
    const tx = response.data.payload.transaction;
    console.log(tx);
    if (response.data.meta.status === 'pending') {
      const localPendingTx = searchInLocalPendingTransactions(address, hash);
      if (localPendingTx) return localPendingTx;

      const providerTx = await getCustomChainTransaction({ chainId, hash });
      return providerTx;
    }
    const parsedTx = parseTransaction({ tx, currency, chainId });
    if (!parsedTx) throw new Error('Failed to parse transaction');
    return parsedTx;
  } catch (e) {
    // if it's a pending tx BE may be in another mempool and it will return 404,
    // which throws and gets caught here, so we check if we got it in localstorage
    const localPendingTx = searchInLocalPendingTransactions(address, hash);
    if (localPendingTx) return localPendingTx;

    logger.error(new RainbowError('fetchTransaction: '), {
      message: (e as Error)?.message,
    });
    throw e; // log & rethrow
  }
};

type PaginatedTransactions = { pages: ConsolidatedTransactionsResult[] };

export function useBackendTransaction({
  hash,
  chainId,
  enabled,
}: {
  hash?: TxHash;
  chainId?: ChainId;
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
    queryFn: () =>
      fetchTransaction({
        hash: params.hash,
        address: params.address,
        currency: params.currency,
        chainId: params.chainId!,
      }),
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
  if (!transaction)
    throw `getCustomChainTransaction: couldn't find transaction`;

  const block = transaction?.blockHash
    ? await provider.getBlock(transaction?.blockHash)
    : undefined;

  // backend returns the value formatted to decimals, so lets do the same here
  const decimals = 18; // assuming every chain uses 18 decimals
  console.log('aaaaaaa', transaction);
  const value = formatUnits(transaction.value, decimals);

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
        value: value,
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
        value: value,
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
  hash?: TxHash;
  chainId?: ChainId;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: createQueryKey('providerTransaction', { chainId, hash }),
    queryFn: () =>
      getCustomChainTransaction({ chainId: chainId!, hash: hash! }),
    enabled: !!hash && !!chainId && enabled,
  });
}

export const useTransaction = ({
  chainId,
  hash,
}: {
  chainId?: number;
  hash?: `0x${string}`;
}) => {
  const customChain = !!chainId && isCustomChain(chainId);
  const {
    data: backendTransaction,
    isLoading: backendTransactionIsLoading,
    isFetched: backendTransactionIsFetched,
  } = useBackendTransaction({
    hash,
    chainId,
    enabled: !customChain && !!hash && !!chainId,
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

// {
//   "hash": "0xa4b337726133df28af806ab316cf7faeb7a1bbfa39d931cd218a25f0ea6781ba",
//   "type": 2,
//   "accessList": [],
//   "blockHash": null,
//   "blockNumber": null,
//   "transactionIndex": null,
//   "confirmations": 0,
//   "from": "0x507F0daA42b215273B8a063B092ff3b6d27767aF",
//   "gasPrice": {
//       "type": "BigNumber",
//       "hex": "0x04e3b29200"
//   },
//   "maxPriorityFeePerGas": {
//       "type": "BigNumber",
//       "hex": "0x3b9aca00"
//   },
//   "maxFeePerGas": {
//       "type": "BigNumber",
//       "hex": "0x04e3b29200"
//   },
//   "gasLimit": {
//       "type": "BigNumber",
//       "hex": "0x0298ba"
//   },
//   "to": "0x00000000009726632680FB29d3F7A9734E3010E2",
//   "value": {
//       "type": "BigNumber",
//       "hex": "0x18de76816d8000"
//   },
//   "nonce": 230,
//   "data": "0x3c2b9a7d0000000000000000000000007fd4d7737597e7b4ee22acbf8d94362343ae0a790000000000000000000000001111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000361d6c5d380000000000000000000000000000000000000000000000000000000000000000c80502b1c500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018a8591510480000000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340aaea0db2b27344f20e0245d3b058d746e9dd98d5520b7e0f000000000000000000000000000000000000000000000000e76c9849",
//   "r": "0xec9fb10f291fde2dda7795b9a028fe5d7d752baf66e175038a9e22db3d2567e4",
//   "s": "0x70c9c53275f1348bd67d4c43187675d78e05be0061e2f8a9b882aa7de7703b6c",
//   "v": 0,
//   "creates": null,
//   "chainId": 1
// }
