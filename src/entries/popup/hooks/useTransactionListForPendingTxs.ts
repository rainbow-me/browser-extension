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
import { staleBalancesStore } from '~/core/state/staleBalances';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getSupportedChains, useSupportedChains } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

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
  const { setNonce } = nonceStore.getState();
  const {
    setPendingTransactions,
    pendingTransactions: storePendingTransactions,
  } = pendingTransactionsStore.getState();
  const pendingTransactions = storePendingTransactions[currentAddress] || [];
  const supportedChainIds = getSupportedChains({
    testnets: false,
  }).map(({ id }) => id);
  // const { testnetMode } = testnetModeStore.getState();
  const { createStaleBalanceExpiration, staleBalances } =
    staleBalancesStore.getState();
  const staleBalancesForUser = staleBalances[currentAddress];
  let staleAssetsToUpdateWithExpiration: Record<
    number,
    {
      address: Address;
      transactionHash: string;
      expirationTime?: number;
    }[]
  > = [];
  for (const supportedChainId of supportedChainIds) {
    const latestTxConfirmedByBackend = latestTransactions.get(supportedChainId);
    if (latestTxConfirmedByBackend) {
      const latestNonceConfirmedByBackend =
        latestTxConfirmedByBackend.nonce || 0;
      const staleBalancesForChain =
        staleBalancesForUser[supportedChainId] || {};
      const staleAssetsToUpdateWithExpirationForChain = Object.values(
        staleBalancesForChain,
      ).filter((a) => {
        return a.nonce <= latestNonceConfirmedByBackend;
      });
      staleAssetsToUpdateWithExpiration = {
        ...staleAssetsToUpdateWithExpiration,
        [supportedChainId]: {
          ...(staleAssetsToUpdateWithExpiration[supportedChainId] || {}),
          ...staleAssetsToUpdateWithExpirationForChain,
        },
      };
      console.log(
        'STALE ASSETS TO UPDATE WITH EXP: IN LIST FOR PENDING TX',
        staleAssetsToUpdateWithExpirationForChain,
        latestTxConfirmedByBackend,
        staleBalancesForUser,
        staleBalances,
        currentAddress,
      );
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

      if (Object.keys(staleAssetsToUpdateWithExpiration).length) {
        for (const chain of Object.keys(staleAssetsToUpdateWithExpiration)) {
          for (const staleBalance of Object.values(
            staleAssetsToUpdateWithExpiration[parseInt(chain)],
          )) {
            createStaleBalanceExpiration({
              address: currentAddress,
              chainId: parseInt(chain),
              assetAddress: staleBalance.address,
            });
            console.log('ADDING STALE BALANCE EXP: ', {
              address: currentAddress,
              chainId: parseInt(chain),
              assetAddress: staleBalance.address,
            });
          }
        }
      }

      // await queryClient.refetchQueries({
      //   queryKey: userAssetsQueryKey({
      //     address: currentAddress,
      //     currency,
      //     testnetMode,
      //   }),
      // });

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
