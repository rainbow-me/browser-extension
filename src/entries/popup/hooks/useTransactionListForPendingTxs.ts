import { useEffect } from 'react';
import { Address } from 'viem';

import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { useConsolidatedTransactions } from '~/core/resources/transactions/consolidatedTransactions';
import {
  currentCurrencyStore,
  pendingTransactionsStore,
  useCurrentAddressStore,
  useCurrentCurrencyStore,
} from '~/core/state';
import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { staleBalancesStore } from '~/core/state/staleBalances';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { useSupportedChains } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

export const useTransactionListForPendingTxs = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { testnetMode } = useTestnetModeStore();
  const supportedChains = useBackendNetworksStore((state) =>
    state.getSupportedChains(),
  );

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
          supportedChains.map((chain) => [
            chain.id,
            null as RainbowTransaction | null,
          ]),
        ),
      );
    watchForPendingTransactionsReportedByRainbowBackend({
      currentAddress: address,
      latestTransactions,
    });
  }, [address, data?.pages, supportedChains]);
};

function watchForPendingTransactionsReportedByRainbowBackend({
  currentAddress,
  latestTransactions,
}: {
  currentAddress: Address;
  latestTransactions: Map<ChainId, RainbowTransaction | null>;
}) {
  const {
    setPendingTransactions,
    pendingTransactions: storePendingTransactions,
  } = pendingTransactionsStore.getState();
  const pendingTransactions = storePendingTransactions[currentAddress] || [];
  const { addStaleBalance } = staleBalancesStore.getState();
  const { currentCurrency } = currentCurrencyStore.getState();

  const newlyConfirmedTransactions: RainbowTransaction[] = [];
  const updatedPendingTransactions: RainbowTransaction[] = [];

  pendingTransactions.forEach((tx) => {
    const txNonce = tx.nonce || 0;
    const latestTx = latestTransactions.get(tx.chainId);
    const latestTxNonce = latestTx?.nonce || 0;
    // still pending or backend is not returning confirmation yet
    // if !latestTx means that is the first tx of the wallet
    const newlyConfirmed = latestTxNonce && txNonce <= latestTxNonce;
    if (newlyConfirmed) {
      newlyConfirmedTransactions.push(tx);
    } else {
      updatedPendingTransactions.push(tx);
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

  setPendingTransactions({
    address: currentAddress,
    pendingTransactions: updatedPendingTransactions,
  });
}
