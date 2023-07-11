import { getPublicClient } from '@wagmi/core';
import { useCallback } from 'react';
import { Address } from 'wagmi';

import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { fetchTransactions } from '~/core/resources/transactions/transactions';
import {
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import {
  getPendingTransactionData,
  getTransactionFlashbotStatus,
  getTransactionHash,
  getTransactionReceiptStatus,
} from '~/core/utils/transactions';

import { useSwapRefreshAssets } from './swap/useSwapAssetsRefresh';

const isPendingTransaction = (status: TransactionStatus) => {
  return (
    status === TransactionStatus.approving ||
    status === TransactionStatus.bridging ||
    status === TransactionStatus.cancelling ||
    status === TransactionStatus.depositing ||
    status === TransactionStatus.purchasing ||
    status === TransactionStatus.receiving ||
    status === TransactionStatus.sending ||
    status === TransactionStatus.speeding_up ||
    status === TransactionStatus.swapping ||
    status === TransactionStatus.withdrawing
  );
};

export const useWatchPendingTransactions = ({
  address,
}: {
  address?: Address;
}) => {
  const { swapRefreshAssets } = useSwapRefreshAssets();
  const { getPendingTransactions, setPendingTransactions } =
    usePendingTransactionsStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const watchPendingTransactions = useCallback(async () => {
    const pendingTransactions = getPendingTransactions({
      address,
    });
    if (!pendingTransactions?.length || !address) return;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map(async (tx) => {
        let updatedTransaction = { ...tx };
        const txHash = getTransactionHash(tx);
        try {
          const chainId = tx?.chainId;
          if (chainId) {
            const provider = getPublicClient({ chainId });
            if (txHash) {
              const currentNonceForChainId = await provider.getTransactionCount(
                address,
                'latest',
              );
              const transactionResponse = await provider.getTransaction(txHash);
              const nonceAlreadyIncluded =
                currentNonceForChainId >
                (tx?.nonce || transactionResponse?.nonce);
              const transactionStatus = await getTransactionReceiptStatus({
                included: nonceAlreadyIncluded,
                transaction: tx,
                transactionResponse,
              });
              let pendingTransactionData = getPendingTransactionData({
                transaction: tx,
                transactionStatus,
              });

              if (
                (transactionResponse?.blockNumber &&
                  transactionResponse?.blockHash) ||
                nonceAlreadyIncluded
              ) {
                if (updatedTransaction.type === TransactionType.trade) {
                  swapRefreshAssets(tx.nonce);
                } else {
                  userAssetsFetchQuery({
                    address,
                    currency: currentCurrency,
                    connectedToHardhat,
                  });
                }

                const latestTransactionsConfirmedByBackend =
                  await fetchTransactions(
                    {
                      address,
                      chainId,
                      currency: currentCurrency,
                      transactionsLimit: 1,
                    },
                    { cacheTime: 0 },
                  );
                const latest = latestTransactionsConfirmedByBackend?.[0];
                if (latest && getTransactionHash(latest) === tx?.hash) {
                  updatedTransaction = {
                    ...updatedTransaction,
                    ...latest,
                  };
                } else {
                  updatedTransaction = {
                    ...updatedTransaction,
                    ...pendingTransactionData,
                  };
                }
              } else if (tx.flashbots) {
                const flashbotsTxStatus = await getTransactionFlashbotStatus(
                  updatedTransaction,
                  txHash,
                );
                if (flashbotsTxStatus) {
                  pendingTransactionData = flashbotsTxStatus;
                }
              }
            }
          } else {
            throw new Error('Pending transaction missing chain id');
          }
        } catch (e) {
          console.log('ERROR WATCHING PENDING TX: ', e);
        }
        return updatedTransaction;
      }),
    );

    setPendingTransactions({
      address,
      pendingTransactions: updatedPendingTransactions.filter((tx) =>
        isPendingTransaction(tx?.status as TransactionStatus),
      ),
    });
  }, [
    address,
    connectedToHardhat,
    currentCurrency,
    getPendingTransactions,
    setPendingTransactions,
    swapRefreshAssets,
  ]);

  return { watchPendingTransactions };
};
