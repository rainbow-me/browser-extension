import { getProvider } from '@wagmi/core';
import { useCallback } from 'react';
import { Address } from 'wagmi';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { fetchTransactions } from '~/core/resources/transactions/transactions';
import {
  useCurrentCurrencyStore,
  useNonceStore,
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
  const { setNonce } = useNonceStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const pendingTransactions = getPendingTransactions({
    address,
  });
  const { addCustomNetworkTransactions } = useCustomNetworkTransactionsStore();
  const pendingTransactionsByDescendingNonce = pendingTransactions
    .filter((tx) => isLowerCaseMatch(tx?.from, address))
    .sort(({ nonce: n1 }, { nonce: n2 }) => (n2 ?? 0) - (n1 ?? 0));

  const refreshAssets = useCallback(
    (tx: RainbowTransaction) => {
      if (tx.type === 'swap') {
        swapRefreshAssets(tx.nonce);
      } else {
        userAssetsFetchQuery({
          address,
          currency: currentCurrency,
        });
      }
    },
    [address, currentCurrency, swapRefreshAssets],
  );

  const watchPendingTransactions = useCallback(async () => {
    if (!pendingTransactions?.length || !address) return;
    let pendingTransactionReportedByRainbowBackend = false;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map(async (tx) => {
        let updatedTransaction: RainbowTransaction = { ...tx };
        try {
          const chainId = tx?.chainId;
          if (chainId && tx.hash) {
            const provider = getProvider({ chainId });
            const currentTxCountForChainId = await provider.getTransactionCount(
              address,
              'latest',
            );
            const transactionResponse = await provider.getTransaction(tx.hash);
            const transactionStatus = await getTransactionReceiptStatus({
              transactionResponse,
              provider,
            });
            const transactionNonce = tx.nonce || transactionResponse?.nonce;
            const nonceAlreadyIncluded =
              currentTxCountForChainId > transactionNonce;
            const transactionExecuted =
              (transactionResponse?.blockNumber &&
                transactionResponse?.blockHash) ||
              nonceAlreadyIncluded;
            let pendingTransactionData = {
              ...tx,
              ...transactionStatus,
            };
            if (transactionExecuted) {
              refreshAssets(tx);

              const transactionsConfirmedByBackend = !isCustomChain(chainId)
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

              const latestTransactionConfirmedByBackend =
                transactionsConfirmedByBackend?.[0];

              const latestPendingNonceForChainId =
                pendingTransactionsByDescendingNonce?.filter(
                  (tx) => tx?.chainId === chainId,
                )?.[0]?.nonce || 0;

              const currentNonceForChainId = currentTxCountForChainId - 1 || 0;

              const latestTransactionHashConfirmedByBackend =
                latestTransactionConfirmedByBackend?.hash || null;

              setNonce({
                address,
                chainId,
                currentNonce:
                  currentNonceForChainId > latestPendingNonceForChainId
                    ? currentNonceForChainId
                    : latestPendingNonceForChainId,
                latestConfirmedNonce:
                  latestTransactionConfirmedByBackend?.nonce,
              });

              if (
                tx?.nonce &&
                latestTransactionConfirmedByBackend?.nonce &&
                tx?.nonce <= latestTransactionConfirmedByBackend?.nonce
              ) {
                pendingTransactionReportedByRainbowBackend = true;
              }

              updatedTransaction = {
                ...updatedTransaction,
                ...(latestTransactionHashConfirmedByBackend === tx?.hash
                  ? latestTransactionConfirmedByBackend
                  : pendingTransactionData),
              };
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
        queryKey: ['consolidatedTransactions'],
        exact: false,
      });
    }

    console.log('updatedPendingTransactions', updatedPendingTransactions);

    const { newPendingTransactions, minedTransactions } =
      updatedPendingTransactions.reduce(
        (acc, tx) => {
          console.log('ENDDD tx.status', tx.status);
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
    refreshAssets,
    setNonce,
    setPendingTransactions,
  ]);

  return { watchPendingTransactions };
};
