import { useEffect } from 'react';
import { Address } from 'viem';

import { useConsolidatedTransactions } from '~/core/resources/transactions/consolidatedTransactions';
import {
  nonceStore,
  pendingTransactionsStore,
  useCurrentAddressStore,
  useCurrentCurrencyStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import {
  getSupportedChainIds,
  useBackendSupportedChains,
} from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

export const useTransactionListForPendingTxs = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { testnetMode } = useTestnetModeStore();

  const supportedChainIds = useBackendSupportedChains({ testnetMode }).map(
    ({ id }) => id,
  );

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
          getSupportedChainIds().map((chain) => [
            chain,
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
  const { setNonce } = nonceStore.getState();
  const {
    setPendingTransactions,
    pendingTransactions: storePendingTransactions,
  } = pendingTransactionsStore.getState();
  const pendingTransactions = storePendingTransactions[currentAddress] || [];
  const supportedChainIds = getSupportedChainIds();
  for (const supportedChainId of supportedChainIds) {
    const latestTxConfirmedByBackend = latestTransactions.get(supportedChainId);
    if (latestTxConfirmedByBackend) {
      const latestNonceConfirmedByBackend =
        latestTxConfirmedByBackend.nonce || 0;
      const [latestPendingTx] = pendingTransactions.filter(
        (tx) => tx?.chainId === supportedChainId,
      );

      let currentNonce;
      if (latestPendingTx) {
        const latestPendingNonce = latestPendingTx?.nonce || 0;
        const latestTransactionIsPending =
          latestPendingNonce > latestNonceConfirmedByBackend;
        currentNonce = latestTransactionIsPending
          ? latestPendingNonce
          : latestNonceConfirmedByBackend;
      } else {
        currentNonce = latestNonceConfirmedByBackend;
      }

      setNonce({
        address: currentAddress,
        chainId: supportedChainId,
        currentNonce,
        latestConfirmedNonce: latestNonceConfirmedByBackend,
      });
    }
  }

  const updatedPendingTransactions = pendingTransactions?.filter((tx) => {
    const txNonce = tx.nonce || 0;
    const latestTx = latestTransactions.get(tx.chainId);
    const latestTxNonce = latestTx?.nonce || 0;
    // still pending or backend is not returning confirmation yet
    // if !latestTx means that is the first tx of the wallet
    return !latestTx || txNonce > latestTxNonce;
  });

  setPendingTransactions({
    address: currentAddress,
    pendingTransactions: updatedPendingTransactions,
  });
}
