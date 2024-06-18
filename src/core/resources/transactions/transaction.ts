import { Provider, TransactionResponse } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { Address, Hash } from 'viem';

import { i18n } from '~/core/languages';
import { addysHttp } from '~/core/network/addys';
import { QueryFunctionResult, createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { supportedTransactionsChainIds } from '~/core/references/chains';
import {
  consolidatedTransactionsQueryFunction,
  consolidatedTransactionsQueryKey,
} from '~/core/resources/transactions/consolidatedTransactions';
import {
  pendingTransactionsStore,
  useCurrentAddressStore,
  useCurrentCurrencyStore,
} from '~/core/state';
import { customNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { ChainId } from '~/core/types/chains';
import {
  RainbowTransaction,
  TransactionApiResponse,
  TxHash,
} from '~/core/types/transactions';
import { parseTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
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
  if (!supportedTransactionsChainIds.includes(chainId)) {
    return fetchTransactionDataFromProvider({
      chainId,
      hash,
      account: address,
    });
  }

  try {
    const response = await addysHttp.get<{
      payload: { transaction: TransactionApiResponse };
      meta: { status: string };
    }>(`/${chainId}/${address}/transactions/${hash}`, {
      params: { currency: currency.toLowerCase() },
    });
    const tx = response.data.payload.transaction;
    if (response.data.meta.status === 'pending') {
      const localPendingTx = searchInLocalPendingTransactions(address, hash);
      if (localPendingTx) return localPendingTx;

      const providerTx = await fetchTransactionDataFromProvider({
        chainId,
        hash,
        account: address,
      });
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

async function guessTransactionType(
  provider: Provider,
  transaction: TransactionResponse,
) {
  if (!transaction.to) return 'deployment';

  const code = await provider.getCode(transaction.to);
  if (code && code !== '0x') return 'contract_interaction';

  return 'send';
}

const fetchTransactionDataFromProvider = async ({
  chainId,
  hash,
  account,
}: {
  chainId: number;
  hash: Hash;
  account: Address;
}): Promise<RainbowTransaction> => {
  const provider = getProvider({ chainId });
  const transaction = await provider.getTransaction(hash);

  if (!transaction)
    throw `getCustomChainTransaction: couldn't find transaction`;

  const decimals = 18; // assuming every chain uses 18 decimals
  const value = formatUnits(transaction.value, decimals);

  const direction =
    transaction.from === account ? ('out' as const) : ('in' as const);

  const baseTransaction = {
    hash: transaction.hash as Hash,
    nonce: transaction.nonce,
    chainId: transaction.chainId,
    from: transaction.from as Address,
    to: transaction.to as Address,
    data: transaction.data,
    value,
    direction,

    feeType: !transaction.maxFeePerGas ? 'legacy' : 'eip-1559',
    gasLimit: transaction.gasLimit.toString(),
    maxFeePerGas: transaction.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
    gasPrice: transaction.gasPrice?.toString(),
  } as const;

  if (transaction.blockNumber !== undefined) {
    const [receipt, block, type] = await Promise.all([
      provider.getTransactionReceipt(transaction.hash),
      provider.getBlock(transaction.blockNumber),
      guessTransactionType(provider, transaction),
    ]);
    const status = receipt.status === 1 ? 'confirmed' : 'failed';

    return {
      ...baseTransaction,
      status,
      type,
      title: i18n.t(`transactions.${type}.${status}`),

      blockNumber: transaction.blockNumber,
      minedAt: transaction.timestamp!,
      confirmations: transaction.confirmations,

      gasUsed: receipt.gasUsed.toString(),

      feeType: !block.baseFeePerGas ? 'legacy' : 'eip-1559',
      fee: receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice).toString(),
      baseFee: block.baseFeePerGas?.toString(),
    };
  }

  const type = await guessTransactionType(provider, transaction);

  return {
    ...baseTransaction,
    status: 'pending',
    type,
    title: i18n.t(`transactions.${type}.pending`),
  };
};

type PaginatedTransactions = { pages: ConsolidatedTransactionsResult[] };

const findTransactionInConsolidatedBEQueryCache = (
  queryClient: QueryClient,
  queryKey: ReturnType<typeof consolidatedTransactionsQueryKey>,
  { hash, chainId }: { hash: Hash; chainId: ChainId },
) => {
  const queryData = queryClient.getQueryData<PaginatedTransactions>(queryKey);
  const pages = queryData?.pages;
  if (!pages) return;

  for (const page of pages) {
    const tx = page.transactions.find(
      (tx) => tx.hash === hash && tx.chainId === chainId,
    );
    if (tx) return tx;
  }
};

const findTransactionInCustomNetworkTransactionsStore = (
  account: Address,
  { hash, chainId }: { hash: Hash; chainId: ChainId },
) => {
  const { getCustomNetworkTransactions } =
    customNetworkTransactionsStore.getState();
  return getCustomNetworkTransactions({ address: account }).find(
    (tx) => tx.hash === hash && tx.chainId === chainId,
  );
};

export const useTransaction = ({
  chainId,
  hash,
}: {
  chainId?: number;
  hash?: `0x${string}`;
}) => {
  const queryClient = useQueryClient();

  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { chains } = useUserChains();

  const params = {
    hash: hash!,
    address,
    currency,
    chainId: chainId!,
  };

  const consolidatedTransactionsKey = consolidatedTransactionsQueryKey({
    address,
    currency,
    userChainIds: chains.map((chain) => chain.id),
  });

  return useQuery({
    queryKey: createQueryKey('transaction', params),
    queryFn: () => fetchTransaction(params),
    enabled: !!hash && !!address && !!chainId,
    initialData: () => {
      if (!hash || !chainId) return;

      const tx = supportedTransactionsChainIds.includes(chainId)
        ? findTransactionInConsolidatedBEQueryCache(
            queryClient,
            consolidatedTransactionsKey,
            { hash, chainId },
          )
        : findTransactionInCustomNetworkTransactionsStore(address, {
            hash,
            chainId,
          });

      if (tx) return tx;
    },
    initialDataUpdatedAt: () => {
      if (!chainId || !supportedTransactionsChainIds.includes(chainId))
        return undefined;
      return queryClient.getQueryState(consolidatedTransactionsKey)
        ?.dataUpdatedAt;
    },
  });
};
