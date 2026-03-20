import { Address } from 'viem';

import { fetchTransaction } from '~/core/resources/transactions/transaction';
import {
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import {
  type MinedTxInfo,
  updateBatchesForMinedTx,
} from '~/core/state/batches/updateBatchStatus';
import { isPendingTxTimedOut } from '~/core/state/networks/timing';
import { useStaleBalancesStore } from '~/core/state/staleBalances';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import {
  MinedTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { isCustomChain } from '~/core/utils/chains';
import { getTransactionReceiptStatus } from '~/core/utils/transactions';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

export interface WatchPendingTransactionsOptions {
  /** When true, skip timed-out txs (only check them once on worker start). Default: false */
  skipTimedOutTxs?: boolean;
}

/**
 * Checks receipt status for all pending transactions and updates the store
 * when they are mined. Does NOT remove transactions - that's the popup's job
 * after React Query cache is updated. Runs in background service worker.
 */
export async function watchPendingTransactions(
  options?: WatchPendingTransactionsOptions,
): Promise<void> {
  const { skipTimedOutTxs = false } = options ?? {};
  const { pendingTransactions } = usePendingTransactionsStore.getState();
  const { currentCurrency } = useCurrentCurrencyStore.getState();
  const { updatePendingTransaction } = usePendingTransactionsStore.getState();
  const { addStaleBalance } = useStaleBalancesStore.getState();
  const { addCustomNetworkTransactions } =
    useCustomNetworkTransactionsStore.getState();

  const addresses = Object.keys(pendingTransactions) as Address[];

  const processTx = async (
    addr: Address,
    tx: RainbowTransaction,
  ): Promise<MinedTransaction | null> => {
    let updatedTransaction: RainbowTransaction | null = { ...tx };

    try {
      if (!tx.chainId || !tx.hash) {
        throw new Error('Pending transaction missing chain id or hash');
      }

      if (isCustomChain(tx.chainId)) {
        const provider = getProvider({ chainId: tx.chainId });
        const transactionResponse = await provider.getTransaction(tx.hash);
        const transactionStatus = await getTransactionReceiptStatus({
          transactionResponse,
          provider,
        });
        updatedTransaction = { ...tx, ...transactionStatus };
      } else {
        const transaction = await fetchTransaction({
          hash: tx.hash,
          chainId: tx.chainId,
          address: addr,
          currency: currentCurrency,
        });
        updatedTransaction = { ...tx, ...transaction };
      }
    } catch (e) {
      const errorMessage = (e as Error)?.message ?? String(e);
      logger.error(
        new RainbowError(
          `watchPendingTransactions: Failed to watch transaction`,
          { cause: e },
        ),
        { chainId: tx.chainId },
      );
      if (
        errorMessage.includes('Failed to create provider') ||
        errorMessage.includes('Missing active RPC')
      ) {
        return null;
      }
      return null;
    }

    if (!updatedTransaction || updatedTransaction.status === 'pending') {
      return null;
    }

    return updatedTransaction as MinedTransaction;
  };

  const now = Date.now();
  const allPendingTxs = addresses.flatMap((addr) =>
    (pendingTransactions[addr] || [])
      .filter((tx) => tx.status === 'pending')
      .filter((tx) => {
        if (!skipTimedOutTxs) return true;
        const pendingDurationMs = tx.lastSubmittedTimestamp
          ? now - tx.lastSubmittedTimestamp
          : 0;
        return !isPendingTxTimedOut(tx.chainId, pendingDurationMs);
      })
      .map((tx) => ({ address: addr, tx })),
  );

  const results = await Promise.all(
    allPendingTxs.map(({ address: addr, tx }) => processTx(addr, tx)),
  );

  const minedWithAddress = allPendingTxs
    .map(({ address: addr }, i) => ({ address: addr, mined: results[i] }))
    .filter(
      (r): r is { address: Address; mined: MinedTransaction } =>
        r.mined !== null,
    );

  for (const { address: addr, mined: minedTransaction } of minedWithAddress) {
    // Update tx in-place (pending -> confirmed/failed), keep in store
    updatePendingTransaction({
      address: addr,
      pendingTransaction: minedTransaction,
    });

    // Stale balance markers for asset refresh when popup opens
    if (minedTransaction.changes?.length) {
      minedTransaction.changes.forEach((change) => {
        const changedAsset = change?.asset;
        const changedAssetAddress = changedAsset?.address as Address;
        if (changedAsset) {
          addStaleBalance({
            address: addr,
            chainId: changedAsset.chainId,
            info: {
              address: changedAssetAddress,
              transactionHash: minedTransaction.hash,
            },
          });
        }
      });
    } else if (minedTransaction.asset) {
      const changedAsset = minedTransaction.asset;
      const changedAssetAddress = changedAsset.address as Address;
      addStaleBalance({
        address: addr,
        chainId: changedAsset.chainId,
        info: {
          address: changedAssetAddress,
          transactionHash: minedTransaction.hash,
        },
      });
    }

    // Custom chain txs go to custom network store
    if (isCustomChain(minedTransaction.chainId)) {
      addCustomNetworkTransactions({
        address: addr,
        chainId: minedTransaction.chainId,
        transaction: minedTransaction,
      });
    }

    // Batch status updates
    if (
      minedTransaction.hash &&
      minedTransaction.chainId &&
      minedTransaction.nonce != null
    ) {
      const minedTxInfo: MinedTxInfo = {
        nonce: minedTransaction.nonce,
        chainId: minedTransaction.chainId,
        sender: addr,
        hash: minedTransaction.hash,
        isCancellation: minedTransaction.typeOverride === 'cancel',
      };
      updateBatchesForMinedTx(minedTxInfo)
        .then((batchCount) => {
          if (batchCount > 0) {
            logger.debug(
              `Batch status updated for nonce ${minedTxInfo.nonce} (chain ${minedTxInfo.chainId}): ${batchCount} batch(es) synced`,
            );
          }
        })
        .catch(() => undefined);
    }
  }
}
