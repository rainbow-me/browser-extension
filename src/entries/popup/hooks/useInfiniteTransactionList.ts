import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { queryClient } from '~/core/react-query';
import { shortcuts } from '~/core/references/shortcuts';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import {
  consolidatedTransactionsQueryFunction,
  consolidatedTransactionsQueryKey,
  useConsolidatedTransactions,
} from '~/core/resources/transactions/consolidatedTransactions';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { RainbowTransaction } from '~/core/types/transactions';
import { useSupportedChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useUserChains } from './useUserChains';

// We have page sizes of 100 since goldsky migration, so we only need to cache the first page on navigate away (these pages will be revalidated on return to the page, so we should keep as little pages as possible in cache)
const PAGES_TO_CACHE_LIMIT = 1;
const FIRST_PAGE_REFETCH_INTERVAL = 60000; // 1 minute

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

const stableEmptyPendingTransactionsArray: RainbowTransaction[] = [];

export const useInfiniteTransactionList = ({
  getScrollElement,
}: UseInfiniteTransactionListParams) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const pendingTransactions = usePendingTransactionsStore(
    (s) =>
      s.pendingTransactions[address] || stableEmptyPendingTransactionsArray,
  );
  const [manuallyRefetching, setManuallyRefetching] = useState(false);

  const customNetworkTransactions = useCustomNetworkTransactionsStore(
    (s) => s.customNetworkTransactions,
  );

  const currentAddressCustomNetworkTransactions = useMemo(
    () => Object.values(customNetworkTransactions[address] || {}).flat(),
    [address, customNetworkTransactions],
  );

  const { testnetMode } = useTestnetModeStore();
  const { chains } = useUserChains();
  const userChainIds = chains.map(({ id }) => id);
  const supportedChains = useSupportedChains({ testnets: testnetMode });

  // stable reference
  const supportedChainIds = useMemo(
    () =>
      supportedChains
        .map(({ id }) => id)
        .filter((id) => userChainIds.includes(id)),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    supportedChains
      .map(({ id }) => id)
      .filter((id) => userChainIds.includes(id)),
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isInitialLoading,
    refetch,
    status,
  } = useConsolidatedTransactions({
    address,
    currency,
    userChainIds: supportedChainIds,
  });

  const pages = data?.pages;
  const transactions = useMemo(
    () => pages?.flatMap((p) => p.transactions) || [],
    [pages],
  );

  // Calculate cutoff as the oldest transaction across ALL loaded pages
  // This ensures custom network transactions are progressively shown as we paginate
  const cutoff = useMemo(() => {
    if (!transactions.length) return null;
    const minedAtValues = transactions
      .filter((tx) => tx.status !== 'pending' && 'minedAt' in tx && tx.minedAt)
      .map((tx) => ('minedAt' in tx ? tx.minedAt : undefined))
      .filter((minedAt): minedAt is number => minedAt !== undefined);
    if (!minedAtValues.length) return null;
    return Math.min(...minedAtValues);
  }, [transactions]);

  const transactionsAfterCutoff = useMemo(() => {
    // If no cutoff (initial state before any pages load), show all transactions
    if (!cutoff) {
      return transactions.concat(currentAddressCustomNetworkTransactions);
    }

    // Filter custom network transactions based on cutoff
    // Cutoff represents the oldest backend transaction timestamp across ALL loaded pages
    // We only show custom transactions that are >= cutoff
    // This ensures we progressively reveal custom transactions as we paginate through time
    // Example: Page 1 loads transactions >= 800, so we show custom >= 800
    //          Page 2 loads transactions >= 500, so we show custom >= 500 (including previously hidden ones)
    // Note: No deduplication needed - custom network transactions operate on different chains
    // than backend transactions (custom chains vs supported chains)
    const filteredCustomTransactions =
      currentAddressCustomNetworkTransactions.filter(
        (tx) => tx.status === 'pending' || (tx.minedAt && tx.minedAt >= cutoff),
      );

    // Find where backend transactions transition from >= cutoff to < cutoff
    // This helps us insert custom transactions in the right chronological position
    const cutoffIndex = transactions.findIndex(
      (tx) => tx.status !== 'pending' && tx.minedAt && tx.minedAt < cutoff,
    );

    if (cutoffIndex === -1) {
      // All backend transactions are newer than or equal to cutoff
      // Just append filtered custom transactions (they'll be sorted correctly by selectTransactionsByDate)
      return transactions.concat(filteredCustomTransactions);
    }

    // Return backend transactions up to the cutoff point, then add filtered custom transactions
    // The final sorting by selectTransactionsByDate will ensure correct chronological order
    return [
      ...transactions.slice(0, cutoffIndex),
      ...filteredCustomTransactions,
    ];
  }, [currentAddressCustomNetworkTransactions, cutoff, transactions]);

  const formattedTransactions = useMemo(() => {
    const pendingHashes: string[] = [];
    pendingTransactions.forEach((tx) =>
      pendingHashes.push(`${tx.hash}_${tx.chainId}`),
    );
    return Object.entries(
      selectTransactionsByDate([
        ...pendingTransactions,
        ...transactionsAfterCutoff.filter(
          (tx) => !pendingHashes.includes(`${tx.hash}_${tx.chainId}`),
        ),
      ]),
    ).flat(2);
  }, [pendingTransactions, transactionsAfterCutoff]);

  const infiniteRowVirtualizer = useVirtualizer({
    count: formattedTransactions?.length,
    getScrollElement,
    estimateSize: (i) =>
      typeof formattedTransactions[i] === 'string' ? 34 : 52,
    overscan: 30,
    getItemKey: useCallback(
      (i: number) => {
        const txOrLabel = formattedTransactions[i];
        return typeof txOrLabel === 'string'
          ? txOrLabel
          : txOrLabel.hash + txOrLabel.chainId + txOrLabel.status;
      },
      [formattedTransactions],
    ),
    paddingEnd: 0,
  });

  const virtualRows = infiniteRowVirtualizer.getVirtualItems();

  // Refetch only the first page periodically
  useEffect(() => {
    if (!address || !supportedChainIds.length) return;

    const queryKey = consolidatedTransactionsQueryKey({
      address,
      currency,
      userChainIds: supportedChainIds,
    });

    const refetchFirstPage = async () => {
      try {
        // Fetch only the first page (pageParam: null) to check for changes
        const firstPageResult = await consolidatedTransactionsQueryFunction({
          queryKey,
          pageParam: null,
        } as Parameters<typeof consolidatedTransactionsQueryFunction>[0]);

        // Get the current cached data
        const currentData = queryClient.getQueryData(queryKey) as typeof data;

        // Compare the first transaction to determine if we need a full refetch
        const newFirstTx =
          firstPageResult.transactions.length > 0
            ? firstPageResult.transactions[0]
            : null;
        const currentFirstTx =
          currentData?.pages?.[0]?.transactions?.[0] || null;

        const firstTxChanged =
          !currentFirstTx ||
          !newFirstTx ||
          newFirstTx.hash !== currentFirstTx.hash;

        if (firstTxChanged && (currentData?.pages?.length ?? 0) > 1) {
          // First transaction changed and we have more than one page - trigger full refetch to get all updated pages
          await refetch();
        } else {
          // First transaction unchanged or we only have one page fetched - just update the first page cache quietly
          queryClient.setQueryData(queryKey, (oldData: typeof data) => {
            if (!oldData?.pages?.length) {
              return { pages: [firstPageResult], pageParams: [null] };
            }
            return {
              ...oldData,
              pages: [firstPageResult, ...oldData.pages.slice(1)],
            };
          });
        }
      } catch (error) {
        // Silently fail - we don't want to disrupt the UI if refetch fails
        logger.error(new RainbowError('Failed to refetch first page'), {
          message: error,
        });
      }
    };

    // Refetch immediately on mount, then every interval
    refetchFirstPage();
    const intervalId = setInterval(
      refetchFirstPage,
      FIRST_PAGE_REFETCH_INTERVAL,
    );

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, currency, supportedChainIds]);

  // Fetch next page when user scrolls to the last visible item
  useEffect(() => {
    const [lastRow] = [...virtualRows].reverse();
    if (!lastRow) return;

    // Check if last visible row is near the end of the list
    const isNearEnd = lastRow.index >= formattedTransactions.length - 1;

    if (isNearEnd && hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    virtualRows,
    formattedTransactions.length,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const cleanupPages = useCallback(() => {
    if (!data?.pages) return;

    queryClient.setQueryData(
      consolidatedTransactionsQueryKey({
        address,
        currency,
        userChainIds: supportedChainIds,
      }),
      { ...data, pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT) },
    );
  }, [data, address, currency, supportedChainIds]);

  // Cleanup pages when component mounts or unmounts
  useEffect(() => {
    cleanupPages();
    return () => cleanupPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchTransactions = async () => {
    setManuallyRefetching(true);
    await refetch();
    setManuallyRefetching(false);
  };

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.activity.REFRESH_TRANSACTIONS.key) {
        refetchTransactions();
      }
    },
    condition: () => !manuallyRefetching,
  });

  return {
    error,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isInitialLoading,
    status,
    transactions: formattedTransactions,
    virtualizer: infiniteRowVirtualizer,
    isRefetching: manuallyRefetching,
  };
};
