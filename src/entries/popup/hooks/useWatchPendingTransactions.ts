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
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import {
  MinedTransaction,
  PendingTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { isCustomChain } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  getTransactionFlashbotStatus,
  getTransactionReceiptStatus,
} from '~/core/utils/transactions';

import { useSwapRefreshAssets } from './swap/useSwapAssetsRefresh';

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
  const pendingTransactions = getPendingTransactions({
    address,
  });
  const { addCustomNetworkTransactions } = useCustomNetworkTransactionsStore();
  const pendingTransactionsByDescendingNonce = pendingTransactions
    .filter((tx) => isLowerCaseMatch(tx?.from, address))
    .sort(({ nonce: n1 }, { nonce: n2 }) => (n2 ?? 0) - (n1 ?? 0));

  const watchPendingTransactions = useCallback(async () => {
    if (!pendingTransactions?.length || !address) return;
    let pendingTransactionReportedByRainbowBackend = false;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map(async (tx) => {
        let updatedTransaction: RainbowTransaction = { ...tx };
        try {
          const chainId = tx?.chainId;
          if (chainId) {
            const provider = getProvider({ chainId });
            if (tx.hash) {
              const currentTxCountForChainId =
                await provider.getTransactionCount(address, 'latest');
              const transactionResponse = await provider.getTransaction(
                tx.hash,
              );
              const nonceAlreadyIncluded =
                currentTxCountForChainId >
                (tx?.nonce || transactionResponse?.nonce);

              const transactionStatus = await getTransactionReceiptStatus({
                transactionResponse,
                provider,
              });
              let pendingTransactionData = {
                ...tx,
                ...transactionStatus,
              };

              if (
                (transactionResponse?.blockNumber &&
                  transactionResponse?.blockHash) ||
                nonceAlreadyIncluded
              ) {
                if (updatedTransaction.type === 'swap') {
                  swapRefreshAssets(tx.nonce);
                } else {
                  userAssetsFetchQuery({
                    address,
                    currency: currentCurrency,
                  });
                }

                const latestTransactionsConfirmedByBackend = !isCustomChain(
                  chainId,
                )
                  ? await fetchTransactions(
                      {
                        address,
                        chainId,
                        currency: currentCurrency,
                        transactionsLimit: 1,
                      },
                      { cacheTime: 0 },
                    )
                  : null;
                const latest = latestTransactionsConfirmedByBackend?.[0];

                const latestPendingNonceForChainId =
                  pendingTransactionsByDescendingNonce?.filter(
                    (tx) => tx?.chainId === chainId,
                  )?.[0]?.nonce || 0;
                const currentNonceForChainId =
                  currentTxCountForChainId - 1 || 0;
                const latestTransactionHashConfirmedByBackend = latest
                  ? latest.hash
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
                  tx.hash,
                );
                if (flashbotsTxStatus) {
                  pendingTransactionData = {
                    ...updatedTransaction,
                    ...flashbotsTxStatus,
                  } as RainbowTransaction; // review what's the expected flashbots behaviour here
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
        predicate: (query) =>
          query.queryKey.includes('consolidatedTransactions'),
      });
    }

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
          newPendingTransactions: [] as PendingTransaction[],
          minedTransactions: [] as MinedTransaction[],
        },
      );

    minedTransactions.forEach((minedTransaction) => {
      if (isCustomChain(minedTransaction.chainId)) {
        addCustomNetworkTransactions({
          address,
          chainId: minedTransaction.chainId,
          transaction: minedTransaction,
        });
      }
    });

    setPendingTransactions({
      address,
      pendingTransactions: newPendingTransactions,
    });
  }, [
    addCustomNetworkTransactions,
    address,
    currentCurrency,
    pendingTransactions,
    pendingTransactionsByDescendingNonce,
    setNonce,
    setPendingTransactions,
    swapRefreshAssets,
  ]);

  return { watchPendingTransactions };
};
