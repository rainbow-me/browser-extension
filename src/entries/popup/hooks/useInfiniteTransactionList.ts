import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo } from 'react';

import { queryClient } from '~/core/react-query';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import {
  consolidatedTransactionsQueryKey,
  useConsolidatedTransactions,
} from '~/core/resources/transactions/consolidatedTransactions';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';

const PAGES_TO_CACHE_LIMIT = 2;

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

export default function ({
  getScrollElement,
}: UseInfiniteTransactionListParams) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isInitialLoading,
    status,
  } = useConsolidatedTransactions({ address, currency });
  //   const cutoff = data?.cutoff;
  const pages = data?.pages;
  const transactions = useMemo(
    () =>
      Object.entries(
        selectTransactionsByDate(pages?.flatMap((p) => p.transactions) || []),
      ).flat(2),
    [pages],
  );

  const infiniteRowVirtualizer = useVirtualizer({
    count: transactions?.length,
    getScrollElement,
    estimateSize: (i) => (typeof transactions[i] === 'string' ? 34 : 52),
    overscan: 5,
  });
  const rows = infiniteRowVirtualizer.getVirtualItems();

  useEffect(() => {
    return () => {
      if (data && data?.pages) {
        queryClient.setQueryData(
          consolidatedTransactionsQueryKey({ address, currency }),
          {
            ...data,
            pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT),
          },
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    transactions.length,
    rows,
  ]);

  return {
    error,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    isInitialLoading,
    status,
    transactions,
    virtualizer: infiniteRowVirtualizer,
  };
}
