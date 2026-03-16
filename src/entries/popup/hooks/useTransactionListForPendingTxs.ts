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
import {
  type MinedTxInfo,
  updateBatchesForMinedTx,
} from '~/core/state/batches/updateBatchStatus';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getSupportedChains, useSupportedChains } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { logger } from '~/logger';

/**
 * Pending rows can keep the **old** hash and `typeOverride` after a speed-up or
 * cancel replacement (the dropped tx). Consolidated history already has the
 * **mined** row for that nonce with the correct hash and backend `typeOverride`.
 */
function minedTxInfoForBatchSync(args: {
  pending: RainbowTransaction;
  /** Already limited to `from === wallet` (see consolidated query). */
  consolidatedForWallet: RainbowTransaction[];
  wallet: Address;
}): MinedTxInfo | null {
  const { pending, consolidatedForWallet, wallet } = args;
  if (!pending.hash || pending.chainId == null || pending.nonce == null) {
    return null;
  }

  const minedFromBackend = consolidatedForWallet.find(
    (row) =>
      row.chainId === pending.chainId &&
      row.nonce === pending.nonce &&
      row.status !== 'pending',
  );

  return {
    nonce: pending.nonce,
    chainId: pending.chainId,
    sender: wallet,
    hash: minedFromBackend?.hash ?? pending.hash,
    isCancellation: minedFromBackend
      ? minedFromBackend.typeOverride === 'cancel'
      : pending.typeOverride === 'cancel',
  };
}

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

    const consolidatedForWallet = data.pages
      .flatMap((p) => p.transactions)
      .filter((t) => isLowerCaseMatch(t.from, address));

    const latestTransactions = consolidatedForWallet.reduce(
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
      consolidatedForWallet,
    });
  }, [address, data?.pages]);
};

function watchForPendingTransactionsReportedByRainbowBackend({
  currentAddress,
  latestTransactions,
  consolidatedForWallet,
}: {
  currentAddress: Address;
  latestTransactions: Map<ChainId, RainbowTransaction | null>;
  consolidatedForWallet: RainbowTransaction[];
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
      const changedAssetAddress = changedAsset.address as Address;
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

  if (newlyConfirmedTransactions.length > 0) {
    newlyConfirmedTransactions.forEach((tx) => {
      const minedTxInfo = minedTxInfoForBatchSync({
        pending: tx,
        consolidatedForWallet,
        wallet: currentAddress,
      });
      if (!minedTxInfo) return;

      updateBatchesForMinedTx(minedTxInfo)
        .then((batchCount) => {
          if (batchCount > 0) {
            logger.debug(
              `Batch status updated for nonce ${minedTxInfo.nonce} (chain ${minedTxInfo.chainId}): ${batchCount} batch(es) synced`,
            );
          } else {
            logger.debug(
              `No batch matched nonce ${minedTxInfo.nonce} on chain ${minedTxInfo.chainId}`,
            );
          }
        })
        .catch(() => undefined);
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
