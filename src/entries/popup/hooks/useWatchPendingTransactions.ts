import { useCallback, useMemo } from 'react';
import { Address } from 'viem';

import { queryClient } from '~/core/react-query';
import { userAssetsQueryKey } from '~/core/resources/assets/common';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { consolidatedTransactionsQueryKey } from '~/core/resources/transactions/consolidatedTransactions';
import { fetchTransaction } from '~/core/resources/transactions/transaction';
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
import { isCustomChain } from '~/core/utils/chains';
import { getTransactionReceiptStatus } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { RainbowError, logger } from '~/logger';

export const useWatchPendingTransactions = ({
  address,
}: {
  address: Address;
}) => {
  const {
    pendingTransactions: storePendingTransactions,
    setPendingTransactions,
  } = usePendingTransactionsStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const addCustomNetworkTransactions = useCustomNetworkTransactionsStore(
    (state) => state.addCustomNetworkTransactions,
  );
  const enabledChainIds = useNetworkStore((state) => state.enabledChainIds);
  const { testnetMode } = useTestnetModeStore();
  const { addStaleBalance } = useStaleBalancesStore();

  const pendingTransactions = useMemo(
    () => storePendingTransactions[address] || [],
    [address, storePendingTransactions],
  );

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
          ),
          {
            message: e.message,
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

    const { newPendingTransactions, minedTransactions } =
      updatedPendingTransactions.reduce(
        (acc, tx) => {
          if (tx?.status === 'pending') {
            acc.newPendingTransactions.push(tx);
          } else {
            acc.minedTransactions.push(tx);
          }
          return acc;
        },
        {
          newPendingTransactions: [] as RainbowTransaction[],
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
      await queryClient.refetchQueries({
        queryKey: consolidatedTransactionsQueryKey({
          address,
          currency: currentCurrency,
          userChainIds: Array.from(enabledChainIds),
        }),
      });
      await queryClient.refetchQueries({
        queryKey: userAssetsQueryKey({
          address,
          currency: currentCurrency,
          testnetMode,
        }),
      });
    }

    setPendingTransactions({
      address,
      pendingTransactions: newPendingTransactions,
    });
  }, [
    addStaleBalance,
    addCustomNetworkTransactions,
    address,
    currentCurrency,
    pendingTransactions,
    processPendingTransaction,
    setPendingTransactions,
    testnetMode,
    enabledChainIds,
  ]);

  return { watchPendingTransactions };
};
