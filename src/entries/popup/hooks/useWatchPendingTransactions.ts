import { getProvider, mainnet } from '@wagmi/core';
import { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { consolidatedTransactionsQueryKey } from '~/core/resources/transactions/consolidatedTransactions';
import { fetchTransaction } from '~/core/resources/transactions/transaction';
import {
  useCurrentCurrencyStore,
  useNonceStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  MinedTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { isCustomChain } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  getTransactionFlashbotStatus,
  getTransactionReceiptStatus,
} from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { useSwapRefreshAssets } from './swap/useSwapAssetsRefresh';

export const useWatchPendingTransactions = ({
  address,
}: {
  address: Address;
}) => {
  const { swapRefreshAssets } = useSwapRefreshAssets();
  const {
    pendingTransactions: storePendingTransactions,
    setPendingTransactions,
  } = usePendingTransactionsStore();
  const { setNonce } = useNonceStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { addCustomNetworkTransactions } = useCustomNetworkTransactionsStore();
  const { userChains } = useUserChainsStore();
  const { testnetMode } = useTestnetModeStore();

  const pendingTransactions = useMemo(
    () => storePendingTransactions[address] || [],
    [address, storePendingTransactions],
  );

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

  const processFlashbotsTransaction = useCallback(
    async (tx: RainbowTransaction): Promise<RainbowTransaction> => {
      const flashbotsTxStatus = await getTransactionFlashbotStatus(tx, tx.hash);
      if (flashbotsTxStatus) {
        const { flashbotsStatus, status, minedAt, title } = flashbotsTxStatus;

        return {
          ...tx,
          status,
          minedAt,
          title,
          flashbotsStatus,
        } as RainbowTransaction;
      }
      return tx;
    },
    [],
  );

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
            console.log('about to process supported network transaction');
            updatedTransaction =
              await processSupportedNetworkTransaction(updatedTransaction);
            console.log(
              'processed supported network transaction ',
              updatedTransaction,
            );
            // if flashbots tx and no blockNumber, check if it failed
            if (!(tx as MinedTransaction).blockNumber && tx.flashbots) {
              console.log('about process flashbogts', updatedTransaction);
              updatedTransaction =
                await processFlashbotsTransaction(updatedTransaction);
              console.log('proceced flashbogts', updatedTransaction);
            }
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
        refreshAssets(tx);
      }
      return updatedTransaction;
    },
    [
      address,
      processCustomNetworkTransaction,
      processFlashbotsTransaction,
      processSupportedNetworkTransaction,
      refreshAssets,
    ],
  );

  const processNonces = useCallback(
    (txs: RainbowTransaction[]) => {
      const userTxs = txs.filter((tx) => isLowerCaseMatch(address, tx.from));
      const chainIds = [
        ...new Set(
          userTxs.reduce((acc, tx) => {
            acc.add(tx.chainId);
            return acc;
          }, new Set<number>()),
        ),
      ];
      let flashbotsTxFailed = false;
      const highestNoncePerChainId = userTxs.reduce((acc, tx) => {
        // if tx is not on mainnet, we don't care about the nonce
        if (tx.chainId !== mainnet.id) {
          acc.set(tx.chainId, tx.nonce);
          return acc;
        }
        // if tx is flashbots and failed, we want to use the lowest nonce
        if (
          tx.flashbots &&
          (tx as MinedTransaction)?.flashbotsStatus === 'FAILED'
        ) {
          // if we already have a failed flashbots tx, we want to use the lowest nonce
          if (flashbotsTxFailed && tx.nonce < acc.get(tx.chainId)) {
            acc.set(tx.chainId, tx.nonce);
          } else {
            acc.set(tx.chainId, tx.nonce);
            flashbotsTxFailed = true;
          }
          // if tx succeeded, we want to use the highest nonce
        } else if (!flashbotsTxFailed && tx.nonce > acc.get(tx.chainId)) {
          acc.set(tx.chainId, tx.nonce);
        }
        return acc;
      }, new Map());

      chainIds.map(async (chainId) => {
        const provider = getProvider({ chainId });
        const providerTransactionCount = await provider.getTransactionCount(
          address,
          'latest',
        );
        const currentProviderNonce = providerTransactionCount - 1;
        const currentNonceForChainId = highestNoncePerChainId.get(chainId) - 1;
        setNonce({
          address,
          chainId,
          currentNonce:
            currentProviderNonce > currentNonceForChainId
              ? currentProviderNonce
              : currentNonceForChainId,
          latestConfirmedNonce: currentProviderNonce,
        });
      });
    },
    [address, setNonce],
  );

  const watchPendingTransactions = useCallback(async () => {
    if (!pendingTransactions?.length) return;
    const updatedPendingTransactions = await Promise.all(
      pendingTransactions.map((tx) => processPendingTransaction(tx)),
    );

    processNonces(updatedPendingTransactions);

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

    if (minedTransactions.length) {
      await queryClient.refetchQueries({
        queryKey: consolidatedTransactionsQueryKey({
          address,
          currency: currentCurrency,
          testnetMode,
          userChainIds: Object.keys(userChains).map(Number),
        }),
      });
    }

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
    processNonces,
    processPendingTransaction,
    setPendingTransactions,
    testnetMode,
    userChains,
  ]);

  return { watchPendingTransactions };
};
