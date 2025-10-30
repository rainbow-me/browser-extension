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

import useComponentWillUnmount from './useComponentWillUnmount';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useUserChains } from './useUserChains';

const PAGES_TO_CACHE_LIMIT = 2;

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
  const supportedChainIds = useSupportedChains({ testnets: testnetMode })
    .map(({ id }) => id)
    .filter((id) => userChainIds.includes(id));

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
    paddingEnd: 64,
  });
  const rows = infiniteRowVirtualizer.getVirtualItems();

  const cleanupPages = useCallback(() => {
    if (data && data?.pages) {
      queryClient.setQueryData(
        consolidatedTransactionsQueryKey({
          address,
          currency,
          userChainIds: supportedChainIds,
        }),
        {
          ...data,
          pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT),
        },
      );
    }
  }, [address, currency, data, supportedChainIds]);

  useComponentWillUnmount(cleanupPages);

  useEffect(() => {
    const [lastRow] = [...rows].reverse();
    if (!lastRow) return;
    if (
      lastRow.index >= transactions.length - 1 &&
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    } else if (
      // BE does not guarantee a particular number of transactions per page
      // BE grabs a group from our data providers then filters for various reasons
      // there are rare cases where BE filters out so many transactions on a page
      // that we end up not filling the list UI, preventing the user from paginating via scroll
      // so we recursively paginate until we know the UI is full
      transactionsAfterCutoff.length < 8 &&
      hasNextPage &&
      !isFetching &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    data?.pages?.length,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    transactions.length,
    transactionsAfterCutoff.length,
    rows,
  ]);

  const refetchTransactions = async () => {
    setManuallyRefetching(true);
    try {
      const queryKey = consolidatedTransactionsQueryKey({
        address,
        currency,
        userChainIds: supportedChainIds,
      });

      // Get current cached data
      const currentData = queryClient.getQueryData<{
        pages: Array<{
          transactions: RainbowTransaction[];
          cutoff?: number;
          nextPage?: string;
        }>;
        pageParams: Array<string | null>;
      }>(queryKey);

      // Fetch only the first page to get new transactions
      // Use fetchInfiniteQuery to properly handle the infinite query structure
      const fetchResult = await queryClient.fetchInfiniteQuery({
        queryKey,
        queryFn: consolidatedTransactionsQueryFunction,
        getNextPageParam: () => undefined, // Only fetch first page
        initialPageParam: null,
      });
      const firstPage = fetchResult.pages[0];

      if (currentData && firstPage) {
        // Create a set of existing transaction hashes for deduplication
        const existingHashes = new Set(
          currentData.pages.flatMap((page) =>
            page.transactions.map((tx) => `${tx.hash}_${tx.chainId}`),
          ),
        );

        // Filter out transactions that already exist
        const newTransactions = firstPage.transactions.filter(
          (tx) => !existingHashes.has(`${tx.hash}_${tx.chainId}`),
        );

        // If there are new transactions, merge them with existing pages
        if (newTransactions.length > 0) {
          queryClient.setQueryData<{
            pages: Array<{
              transactions: RainbowTransaction[];
              cutoff?: number;
              nextPage?: string;
            }>;
            pageParams: Array<string | null>;
          }>(queryKey, (oldData) => {
            if (!oldData) {
              return {
                pages: [firstPage],
                pageParams: [null],
              };
            }

            // Update the first page with new transactions, preserving existing ones
            const existingFirstPage = oldData.pages[0];
            const mergedFirstPageTransactions = [
              ...newTransactions,
              ...existingFirstPage.transactions,
            ];

            // Sort by timestamp (newest first) and deduplicate
            const seen = new Set<string>();
            const deduplicated = mergedFirstPageTransactions.filter((tx) => {
              const key = `${tx.hash}_${tx.chainId}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            // Sort by minedAt (newest first) or keep pending at top
            const sorted = deduplicated.sort((a, b) => {
              if (a.status === 'pending' && b.status !== 'pending') return -1;
              if (a.status !== 'pending' && b.status === 'pending') return 1;
              const aTime =
                a.status !== 'pending' && 'minedAt' in a ? a.minedAt : 0;
              const bTime =
                b.status !== 'pending' && 'minedAt' in b ? b.minedAt : 0;
              return bTime - aTime;
            });

            return {
              ...oldData,
              pages: [
                {
                  ...existingFirstPage,
                  transactions: sorted,
                  cutoff: firstPage.cutoff,
                  nextPage: firstPage.nextPage,
                },
                ...oldData.pages.slice(1),
              ],
            };
          });
        }

        // Invalidate to trigger a re-render with updated data
        await queryClient.invalidateQueries({ queryKey });
      } else {
        // If no cached data, just refetch normally
        await refetch();
      }
    } catch (error) {
      // Fallback to normal refetch on error
      await refetch();
    } finally {
      setManuallyRefetching(false);
    }
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
    refetch: refetchTransactions,
  };
};
