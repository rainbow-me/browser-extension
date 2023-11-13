import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { queryClient } from '~/core/react-query';
import { shortcuts } from '~/core/references/shortcuts';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import {
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

import useComponentWillUnmount from './useComponentWillUnmount';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useUserChains } from './useUserChains';

const PAGES_TO_CACHE_LIMIT = 2;

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

export const useInfiniteTransactionList = ({
  getScrollElement,
}: UseInfiniteTransactionListParams) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { getPendingTransactions } = usePendingTransactionsStore();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const pendingTransactions = getPendingTransactions({ address });
  const { customNetworkTransactions } = useCustomNetworkTransactionsStore();

  const currentAddressCustomNetworkTransactions = useMemo(
    () => Object.values(customNetworkTransactions[address] || {}).flat(),
    [address, customNetworkTransactions],
  );

  const { testnetMode } = useTestnetModeStore();
  const { chains } = useUserChains();
  const userChainIds = chains.map((chain) => chain.id);

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
  } = useConsolidatedTransactions(
    {
      address,
      currency,
      userChainIds,
      testnetMode,
    },
    {
      select: (data) => {
        let prevCutoff = Infinity;
        const selectedPages = data.pages.map((page) => {
          const customNetworkTransactionsForPage =
            currentAddressCustomNetworkTransactions.filter(
              (transaction) =>
                transaction.minedAt > (page?.cutoff || 0) &&
                transaction.minedAt < prevCutoff &&
                userChainIds.includes(transaction.chainId),
            );
          prevCutoff = page.cutoff || prevCutoff;
          return {
            ...page,
            transactions: page.transactions
              .filter((transaction) =>
                userChainIds.includes(transaction.chainId),
              )
              .concat(customNetworkTransactionsForPage),
          };
        });
        return {
          ...data,
          pages: selectedPages,
        };
      },
    },
  );
  const pages = data?.pages;
  const cutoff =
    data?.pages && data?.pages?.length
      ? data?.pages[data?.pages.length - 1]?.cutoff
      : null;
  const transactions = useMemo(
    () => pages?.flatMap((p) => p.transactions) || [],
    [pages],
  );

  const transactionsAfterCutoff = useMemo(() => {
    if (!cutoff) return transactions;
    const cutoffIndex = transactions.findIndex(
      (tx) => tx.status !== 'pending' && tx.minedAt < cutoff,
    );
    if (!cutoffIndex || cutoffIndex === -1) return transactions;
    return [...transactions].slice(0, cutoffIndex);
  }, [cutoff, transactions]);

  const formattedTransactions = useMemo(
    () =>
      Object.entries(
        selectTransactionsByDate([
          ...pendingTransactions,
          ...transactionsAfterCutoff,
        ]),
      ).flat(2),
    [pendingTransactions, transactionsAfterCutoff],
  );

  const infiniteRowVirtualizer = useVirtualizer({
    count: formattedTransactions?.length,
    getScrollElement,
    estimateSize: (i) =>
      typeof formattedTransactions[i] === 'string' ? 34 : 52,
    overscan: 20,
  });
  const rows = infiniteRowVirtualizer.getVirtualItems();

  const cleanupPages = useCallback(() => {
    if (data && data?.pages) {
      queryClient.setQueryData(
        consolidatedTransactionsQueryKey({
          address,
          currency,
          userChainIds,
          testnetMode,
        }),
        {
          ...data,
          pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT),
        },
      );
    }
  }, [address, currency, data, testnetMode, userChainIds]);

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
    data?.pages.length,
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
