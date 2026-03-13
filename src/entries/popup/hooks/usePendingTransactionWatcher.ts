import type { InfiniteData } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import { consolidatedTransactionsQueryKey } from '~/core/resources/transactions/consolidatedTransactions';
import { transactionsQueryKey } from '~/core/resources/transactions/transactions';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import {
  MinedTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { isCustomChain, useSupportedChains } from '~/core/utils/chains';
import { useUserChains } from '~/entries/popup/hooks/useUserChains';

import { wait } from '../handlers/retry';

/**
 * Reactive watcher for confirmed/failed transactions in the pending store.
 * Background updates tx status in-place; this component triggers React Query
 * refetch and removes from pending store only after tx appears in consolidated cache.
 */
export function PendingTransactionWatcher() {
  const address = useCurrentAddressStore((s) => s.currentAddress);
  const { currentCurrency } = useCurrentCurrencyStore();
  const {
    pendingTransactions: storePendingTransactions,
    removePendingTransactionsForAddress,
  } = usePendingTransactionsStore();
  const supportedTransactionsChainIds = useNetworkStore((state) =>
    state.getSupportedTransactionsChainIds(),
  );
  const { testnetMode } = useTestnetModeStore();
  const { chains } = useUserChains();
  const userChainIds = chains.map(({ id }) => id);
  const supportedChains = useSupportedChains({ testnets: testnetMode });
  const supportedChainIds = useMemo(
    () =>
      supportedChains
        .map(({ id }) => id)
        .filter((id) => userChainIds.includes(id)),
    [supportedChains, userChainIds],
  );

  const pendingTransactions = useMemo(
    () => storePendingTransactions[address] || [],
    [address, storePendingTransactions],
  );

  const minedTransactions = useMemo(
    () =>
      pendingTransactions.filter(
        (tx): tx is MinedTransaction => tx.status !== 'pending',
      ),
    [pendingTransactions],
  );

  const invalidationTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    if (!address || !minedTransactions.length) return;

    const queryKey = consolidatedTransactionsQueryKey({
      address,
      currency: currentCurrency,
      userChainIds: supportedChainIds,
    });

    const confirmedChainIds = new Set(
      minedTransactions.map((tx) => tx.chainId),
    );

    const refetchQueries = async () => {
      await Promise.allSettled([
        queryClient.refetchQueries({ queryKey }),
        ...Array.from(confirmedChainIds).map((chainId) =>
          queryClient.refetchQueries({
            queryKey: transactionsQueryKey({
              address,
              chainId,
              currency: currentCurrency,
            }),
          }),
        ),
      ]);
    };

    const runCleanup = async () => {
      await refetchQueries();

      const cachedData = queryClient.getQueryData(queryKey) as
        | InfiniteData<{ transactions: RainbowTransaction[] }>
        | undefined;

      const isTxInCache = (hash: string, chainId: number) =>
        cachedData?.pages?.some(
          (page) =>
            page.transactions?.some(
              (tx) => tx.hash === hash && tx.chainId === chainId,
            ),
        );

      const supportedChainMinedTransactions = minedTransactions.filter((tx) =>
        supportedTransactionsChainIds.includes(tx.chainId),
      );

      const transactionsToRemove = supportedChainMinedTransactions.filter(
        (tx) => isTxInCache(tx.hash, tx.chainId),
      );

      const customChainMinedTransactions = minedTransactions.filter((tx) =>
        isCustomChain(tx.chainId),
      );

      const allToRemove = [
        ...transactionsToRemove,
        ...customChainMinedTransactions,
      ];

      if (allToRemove.length > 0) {
        removePendingTransactionsForAddress({
          address,
          transactionsToRemove: allToRemove.map((tx) => ({
            hash: tx.hash,
            chainId: tx.chainId,
          })),
        });
      }
    };

    const runWithDelays = async () => {
      await wait(1500);
      await runCleanup();

      invalidationTimeoutsRef.current.forEach((timeout) =>
        clearTimeout(timeout),
      );
      invalidationTimeoutsRef.current.clear();

      const refetchDelays = [5000, 16000];
      refetchDelays.forEach((delay) => {
        const timeout = setTimeout(() => {
          invalidationTimeoutsRef.current.delete(timeout);
          runCleanup();
        }, delay);
        invalidationTimeoutsRef.current.add(timeout);
      });
    };

    userAssetsFetchQuery({
      address,
      currency: currentCurrency,
    });

    runWithDelays();

    const timeouts = invalidationTimeoutsRef.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, [
    address,
    currentCurrency,
    minedTransactions,
    removePendingTransactionsForAddress,
    supportedChainIds,
    supportedTransactionsChainIds,
  ]);

  return null;
}
