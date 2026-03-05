import { useEffect } from 'react';
import { Address } from 'viem';

import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { useConsolidatedTransactions } from '~/core/resources/transactions/consolidatedTransactions';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
  useStaleBalancesStore,
} from '~/core/state';
import { updateBatchesForTx } from '~/core/state/batches/updateBatchStatus';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getSupportedChains, useSupportedChains } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { logger } from '~/logger';

export const useTransactionListForPendingTxs = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { testnetMode } = useTestnetModeStore();

  const supportedChainIds = useSupportedChains({
    testnets: testnetMode,
  }).map(({ id }) => id);

  const { data } = useConsolidatedTransactions({
    address,
    currency,
    userChainIds: supportedChainIds,
  });

  useEffect(() => {
    if (!data?.pages) return;
    const latestTransactions = data.pages
      .map((p) => p.transactions)
      .flat()
      .filter((t) => isLowerCaseMatch(t.from, address))
      .reduce(
        (latestTxMap, currentTx) => {
          const currentChain = currentTx?.chainId;
          if (currentChain) {
            const latestTx = latestTxMap.get(currentChain);
            if (!latestTx) {
              latestTxMap.set(currentChain, currentTx);
            }
          }
          return latestTxMap;
        },
        new Map(
          getSupportedChains({ testnets: false }).map((chain) => [
            chain.id,
            null as RainbowTransaction | null,
          ]),
        ),
      );
    watchForPendingTransactionsReportedByRainbowBackend({
      currentAddress: address,
      latestTransactions,
    });
  }, [address, data?.pages]);
};

function watchForPendingTransactionsReportedByRainbowBackend({
  currentAddress,
  latestTransactions,
}: {
  currentAddress: Address;
  latestTransactions: Map<ChainId, RainbowTransaction | null>;
}) {
  const {
    removePendingTransactionsForAddress,
    pendingTransactions: storePendingTransactions,
  } = usePendingTransactionsStore.getState();
  const pendingTransactions = storePendingTransactions[currentAddress] || [];
  const { addStaleBalance } = useStaleBalancesStore.getState();
  const { currentCurrency } = useCurrentCurrencyStore.getState();

  const newlyConfirmedTransactions: RainbowTransaction[] = [];

  pendingTransactions.forEach((tx) => {
    const txNonce = tx.nonce || 0;
    const latestTx = latestTransactions.get(tx.chainId);
    const latestTxNonce = latestTx?.nonce || 0;
    // still pending or backend is not returning confirmation yet
    // if !latestTx means that is the first tx of the wallet
    const newlyConfirmed = latestTxNonce && txNonce <= latestTxNonce;
    if (newlyConfirmed) {
      newlyConfirmedTransactions.push(tx);
    }
  });

  newlyConfirmedTransactions.forEach((tx) => {
    if (tx.changes?.length) {
      tx.changes?.forEach((change) => {
        const changedAsset = change?.asset;
        const changedAssetAddress = changedAsset?.address as Address;
        if (changedAsset) {
          addStaleBalance({
            address: currentAddress,
            chainId: changedAsset?.chainId,
            info: {
              address: changedAssetAddress,
              transactionHash: tx.hash,
            },
          });
        }
      });
    } else if (tx.asset) {
      const changedAsset = tx.asset;
      const changedAssetAddress = changedAsset?.address as Address;
      addStaleBalance({
        address: currentAddress,
        chainId: changedAsset?.chainId,
        info: {
          address: changedAssetAddress,
          transactionHash: tx.hash,
        },
      });
    }
  });

  if (newlyConfirmedTransactions.length) {
    userAssetsFetchQuery({
      address: currentAddress,
      currency: currentCurrency,
    });
  }

  // Sync batch status for confirmed transactions, then remove from pending
  if (newlyConfirmedTransactions.length > 0) {
    newlyConfirmedTransactions.forEach((tx) => {
      if (tx.hash && tx.chainId) {
        updateBatchesForTx(tx.hash, tx.chainId)
          .then((batchCount) => {
            if (batchCount > 0) {
              logger.info(
                `Batch status updated for tx ${tx.hash} (chain ${tx.chainId}): ${batchCount} batch(es) synced`,
              );
            } else {
              logger.debug(
                `No batch matched tx ${tx.hash} on chain ${tx.chainId}`,
              );
            }
          })
          .catch(() => undefined);
      }
    });

    removePendingTransactionsForAddress({
      address: currentAddress,
      transactionsToRemove: newlyConfirmedTransactions.map((tx) => ({
        hash: tx.hash,
        chainId: tx.chainId,
      })),
    });
  }
}
