import { getProvider } from '@wagmi/core';
import { useCallback } from 'react';
import { Address } from 'wagmi';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { fetchTransactions } from '~/core/resources/transactions/transactions';
import {
  nonceStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { isLowerCaseMatch } from '~/core/utils/strings';
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
  const { setNonce } = nonceStore.getState();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const pendingTransactions = getPendingTransactions({
    address,
  });
  const pendingTransactionsByDescendingNonce = pendingTransactions
    .filter((tx) => isLowerCaseMatch(tx?.from, address))
    .sort(({ nonce: n1 }, { nonce: n2 }) => (n2 ?? 0) - (n1 ?? 0));

  const watchPendingTransactions = useCallback(async () => {
    if (!pendingTransactions?.length || !address) return;
    let pendingTransactionReportedByRainbowBackend = false;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map(async (tx) => {
        let updatedTransaction = { ...tx };
        const txHash = getTransactionHash(tx);
        try {
          const chainId = tx?.chainId;
          if (chainId) {
            const provider = getProvider({ chainId });
            if (txHash) {
              const currentTxCountForChainId =
                await provider.getTransactionCount(address, 'latest');
              const transactionResponse = await provider.getTransaction(txHash);
              const nonceAlreadyIncluded =
                currentTxCountForChainId >
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

                const latestPendingNonceForChainId =
                  pendingTransactionsByDescendingNonce?.filter(
                    (tx) => tx?.chainId === chainId,
                  )?.[0]?.nonce || 0;
                const currentNonceForChainId =
                  currentTxCountForChainId - 1 || 0;
                const latestTransactionHashConfirmedByBackend = latest
                  ? getTransactionHash(latest)
                  : null;

                setNonce({
                  address,
                  chainId,
                  currentNonce:
                    currentNonceForChainId > latestPendingNonceForChainId
                      ? currentNonceForChainId
                      : latestPendingNonceForChainId,
                  latestConfirmedNonce: latest?.nonce,
                });

                if (tx?.nonce && latest?.nonce && tx?.nonce <= latest?.nonce) {
                  pendingTransactionReportedByRainbowBackend = true;
                }

                if (latestTransactionHashConfirmedByBackend === tx?.hash) {
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

    if (pendingTransactionReportedByRainbowBackend) {
      queryClient.refetchQueries({
        predicate: (query) => {
          if (query.queryKey.includes('consolidatedTransactions')) {
            return true;
          }
          return false;
        },
      });
    }

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
    pendingTransactions,
    pendingTransactionsByDescendingNonce,
    setNonce,
    setPendingTransactions,
    swapRefreshAssets,
  ]);

  return { watchPendingTransactions };
};
