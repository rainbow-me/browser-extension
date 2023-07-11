import { getPublicClient } from '@wagmi/core';
import { Address } from 'wagmi';

import { fetchTransactions } from '../resources/transactions/transactions';
import { currentCurrencyStore, pendingTransactionsStore } from '../state';
import { TransactionStatus } from '../types/transactions';

import {
  getPendingTransactionData,
  getTransactionFlashbotStatus,
  getTransactionHash,
  getTransactionReceiptStatus,
} from './transactions';

export async function watchPendingTransactions({
  address,
}: {
  address: Address;
}) {
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const pendingTransactions = getPendingTransactions({
    address,
  });
  const { currentCurrency } = currentCurrencyStore.getState();

  if (!pendingTransactions?.length) return;

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
    pendingTransactions: updatedPendingTransactions.filter(
      (tx) => tx?.status !== TransactionStatus?.unknown,
    ),
  });
}
