import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Address } from 'viem';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { consolidatedTransactionsQueryKey } from '~/core/resources/transactions/consolidatedTransactions';
import { fetchTransaction } from '~/core/resources/transactions/transaction';
import { transactionsQueryKey } from '~/core/resources/transactions/transactions';
import {
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import { useStaleBalancesStore } from '~/core/state/staleBalances';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import {
  MinedTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { isCustomChain, useSupportedChains } from '~/core/utils/chains';
import { getTransactionReceiptStatus } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';
import { RainbowError, logger } from '~/logger';

import { wait } from '../handlers/retry';

export const useWatchPendingTransactions = ({
  address,
}: {
  address: Address;
}) => {
  const {
    pendingTransactions: storePendingTransactions,
    removePendingTransactionsForAddress,
  } = usePendingTransactionsStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const addCustomNetworkTransactions = useCustomNetworkTransactionsStore(
    (state) => state.addCustomNetworkTransactions,
  );
  const { addStaleBalance } = useStaleBalancesStore();
  const supportedTransactionsChainIds = useNetworkStore((state) =>
    state.getSupportedTransactionsChainIds(),
  );
  const { testnetMode } = useTestnetModeStore();
  const { chains } = useUserChains();
  const userChainIds = chains.map(({ id }) => id);
  const supportedChains = useSupportedChains({ testnets: testnetMode });
  // Match the exact query key logic from useInfiniteTransactionList
  const supportedChainIds = useMemo(
    () =>
      supportedChains
        .map(({ id }) => id)
        .filter((id) => userChainIds.includes(id)),
    [supportedChains, userChainIds],
  );

  const pendingTransactions = useMemo(
    () => storePendingTransactions[address] || [],
    [address, storePendingTransactions],
  );

  // Store timeout refs for cleanup
  const invalidationTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const refreshAssets = useCallback(() => {
    userAssetsFetchQuery({
      address,
      currency: currentCurrency,
    });
  }, [address, currentCurrency]);

  const processCustomNetworkTransaction = useCallback(
    async (tx: RainbowTransaction) => {
      const provider = getProvider({ chainId: tx.chainId });
      const transactionResponse = await provider.getTransaction(tx.hash);
      const transactionStatus = await getTransactionReceiptStatus({
        transactionResponse,
        provider,
      });
      return {
        ...tx,
        ...transactionStatus,
      };
    },
    [],
  );

  const processSupportedNetworkTransaction = useCallback(
    async (tx: RainbowTransaction) => {
      const transaction = await fetchTransaction({
        hash: tx.hash,
        chainId: tx.chainId,
        address,
        currency: currentCurrency,
      });

      return {
        ...tx,
        ...transaction,
      };
    },
    [address, currentCurrency],
  );

  const processPendingTransaction = useCallback(
    async (tx: RainbowTransaction) => {
      let updatedTransaction: RainbowTransaction = { ...tx };
      try {
        if (tx.chainId && tx.hash && address) {
          if (isCustomChain(tx.chainId)) {
            updatedTransaction =
              await processCustomNetworkTransaction(updatedTransaction);
          } else {
            updatedTransaction =
              await processSupportedNetworkTransaction(updatedTransaction);
          }
        } else {
          throw new Error('Pending transaction missing chain id');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        logger.error(
          new RainbowError(
            `useWatchPendingTransaction: Failed to watch transaction`,
            { cause: e },
          ),
          {
            message: e.message,
            cause: e.cause,
            hash: tx.hash,
            chainId: tx.chainId,
          },
        );
      }

      if (updatedTransaction?.status !== 'pending') {
        refreshAssets();
      }
      return updatedTransaction;
    },
    [
      address,
      processCustomNetworkTransaction,
      processSupportedNetworkTransaction,
      refreshAssets,
    ],
  );

  const watchPendingTransactions = useCallback(async () => {
    if (!pendingTransactions?.length) return;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map((tx) => processPendingTransaction(tx)),
    );

    const { minedTransactions } = updatedPendingTransactions.reduce(
      (acc, tx) => {
        if (tx?.status !== 'pending') {
          acc.minedTransactions.push(tx);
        }
        return acc;
      },
      {
        minedTransactions: [] as MinedTransaction[],
      },
    );

    minedTransactions.forEach((minedTransaction) => {
      if (minedTransaction.changes?.length) {
        minedTransaction.changes?.forEach((change) => {
          const changedAsset = change?.asset;
          const changedAssetAddress = changedAsset?.address as Address;
          if (changedAsset) {
            addStaleBalance({
              address,
              chainId: changedAsset?.chainId,
              info: {
                address: changedAssetAddress,
                transactionHash: minedTransaction.hash,
              },
            });
          }
        });
      } else if (minedTransaction.asset) {
        const changedAsset = minedTransaction.asset;
        const changedAssetAddress = changedAsset?.address as Address;
        addStaleBalance({
          address,
          chainId: changedAsset?.chainId,
          info: {
            address: changedAssetAddress,
            transactionHash: minedTransaction.hash,
          },
        });
      }
      if (isCustomChain(minedTransaction.chainId)) {
        addCustomNetworkTransactions({
          address,
          chainId: minedTransaction.chainId,
          transaction: minedTransaction,
        });
      }
    });

    if (minedTransactions.length) {
      // Filter out custom chain transactions - those are handled separately
      const supportedChainMinedTransactions = minedTransactions.filter((tx) =>
        supportedTransactionsChainIds.includes(tx.chainId),
      );

      if (supportedChainMinedTransactions.length > 0) {
        // Use the same query key logic as useInfiniteTransactionList
        const queryKey = consolidatedTransactionsQueryKey({
          address,
          currency: currentCurrency,
          userChainIds: supportedChainIds,
        });

        // Invalidate per-chain transaction queries for the chains where transactions were confirmed
        const confirmedChainIds = new Set(
          supportedChainMinedTransactions.map((tx) => tx.chainId),
        );

        const refetchQueries = async () => {
          await Promise.allSettled([
            queryClient.refetchQueries({ queryKey }),
            ...Array.from(confirmedChainIds).map((chainId) =>
              queryClient.refetchQueries({
                queryKey: transactionsQueryKey({
                  address,
                  chainId,
                  currency: currentCurrency,
                }),
              }),
            ),
          ]);
        };

        await wait(1500); // wait for the transactions to be enhanced by backend, 1.5s feels like a perfect balance between user does not notice extra time and backend has time to enhance the transactions
        await refetchQueries(); // start refetch, wait for refetch to finish, this way the pending tx does not get removed before the list is refetched

        // Schedule second invalidation after 5 seconds, this is to account for the fact that transactions get enhanced while being visible, and the normal refetch is too slow to feel responsive
        const timeout = setTimeout(() => {
          invalidationTimeoutsRef.current.delete(timeout);
          refetchQueries();
        }, 5000);
        invalidationTimeoutsRef.current.add(timeout);
      }
    }

    // Remove mined transactions, keep the rest as-is
    if (minedTransactions.length > 0) {
      removePendingTransactionsForAddress({
        address,
        transactionsToRemove: minedTransactions.map((tx) => ({
          hash: tx.hash,
          chainId: tx.chainId,
        })),
      });
    }
  }, [
    addStaleBalance,
    addCustomNetworkTransactions,
    address,
    currentCurrency,
    pendingTransactions,
    processPendingTransaction,
    removePendingTransactionsForAddress,
    supportedTransactionsChainIds,
    supportedChainIds,
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = invalidationTimeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeouts.clear();
    };
  }, []);

  return { watchPendingTransactions };
};
