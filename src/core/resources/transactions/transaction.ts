import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { Address, Hash, PublicClient, formatUnits } from 'viem';

import { i18n } from '~/core/languages';
import { platformHttp } from '~/core/network/platform';
import { QueryFunctionResult, createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  consolidatedTransactionsQueryFunction,
  consolidatedTransactionsQueryKey,
} from '~/core/resources/transactions/consolidatedTransactions';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { ChainId } from '~/core/types/chains';
import type { GetTransactionByHashResponse as PlatformGetTransactionByHashResponse } from '~/core/types/gen/platform/transaction/transaction';
import { RainbowTransaction, TxHash } from '~/core/types/transactions';
import { getErrorMessage } from '~/core/utils/errors';
import { convertPlatformTransactionToApiResponse } from '~/core/utils/platform';
import { parseTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { RainbowError, logger } from '~/logger';

type ConsolidatedTransactionsResult = QueryFunctionResult<
  typeof consolidatedTransactionsQueryFunction
>;

const PLATFORM_TRANSACTION_BY_HASH_PATH = '/transactions/GetTransactionByHash';
const PLATFORM_REQUEST_TIMEOUT = 30000;

const searchInLocalPendingTransactions = (userAddress: Address, hash: Hash) => {
  const { pendingTransactions } = usePendingTransactionsStore.getState();
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
  const supportedTransactionsChainIds = useNetworkStore
    .getState()
    .getSupportedTransactionsChainIds();
  if (!supportedTransactionsChainIds.includes(chainId)) {
    return fetchTransactionDataFromProvider({
      chainId,
      hash,
      account: address,
    });
  }

  try {
    const response =
      await platformHttp.get<PlatformGetTransactionByHashResponse>(
        PLATFORM_TRANSACTION_BY_HASH_PATH,
        {
          params: {
            currency: currency.toLowerCase(),
            address,
            chainIds: chainId.toString(),
            hash,
          },
          timeout: PLATFORM_REQUEST_TIMEOUT,
        },
      );
    if (!response.data.result)
      throw new RainbowError('Plattform transaction not found by hash', {
        cause: new Error(
          `Platform transaction not found by hash: ${hash} on chain ${chainId}`,
        ),
      });
    const tx = convertPlatformTransactionToApiResponse(response.data.result);
    if (tx.status === 'pending') {
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
      message: getErrorMessage(e),
    });
    throw e; // log & rethrow
  }
};

async function guessTransactionType(
  client: PublicClient,
  transaction: { to?: string | null },
) {
  if (!transaction.to) return 'deployment';

  const code = await client.getCode({
    address: transaction.to as `0x${string}`,
  });
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
  const client = getViemClient({ chainId });
  const transaction = await client.getTransaction({
    hash: hash as `0x${string}`,
  });

  if (!transaction)
    throw `getCustomChainTransaction: couldn't find transaction`;

  const decimals = 18; // assuming every chain uses 18 decimals
  const value = formatUnits(transaction.value, decimals);

  const direction =
    transaction.from === account ? ('out' as const) : ('in' as const);

  const baseTransaction = {
    hash: transaction.hash as Hash,
    nonce: transaction.nonce,
    chainId: chainId as ChainId,
    from: transaction.from as Address,
    to: transaction.to as Address,
    data: transaction.input,
    value,
    direction,

    feeType: !transaction.maxFeePerGas ? 'legacy' : 'eip-1559',
    gasLimit: transaction.gas.toString(),
    maxFeePerGas: transaction.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
    gasPrice: transaction.gasPrice?.toString(),
  } as const;

  if (transaction.blockNumber !== null) {
    const [receipt, block, type] = await Promise.all([
      client.getTransactionReceipt({
        hash: transaction.hash as `0x${string}`,
      }),
      client.getBlock({
        blockNumber: transaction.blockNumber,
      }),
      guessTransactionType(client, transaction),
    ]);
    const status = receipt.status === 'success' ? 'confirmed' : 'failed';

    return {
      ...baseTransaction,
      status,
      type,
      title: i18n.t(`transactions.${type}.${status}`),

      blockNumber: Number(transaction.blockNumber),
      minedAt: Number(block.timestamp),
      confirmations: 1, // viem doesn't provide confirmations directly

      gasUsed: receipt.gasUsed.toString(),

      feeType: !block.baseFeePerGas ? 'legacy' : 'eip-1559',
      fee: (receipt.cumulativeGasUsed * receipt.effectiveGasPrice).toString(),
      baseFee: block.baseFeePerGas?.toString(),
    };
  }

  const type = await guessTransactionType(client, transaction);

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
    useCustomNetworkTransactionsStore.getState();
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

  const supportedTransactionsChainIds = useNetworkStore((state) =>
    state.getSupportedTransactionsChainIds(),
  );
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
