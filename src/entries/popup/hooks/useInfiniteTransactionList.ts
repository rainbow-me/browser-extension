import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo } from 'react';

import { selectTransactionsByDate } from '~/core/resources/_selectors';
import { useConsolidatedTransactions } from '~/core/resources/transactions/consolidatedTransactions';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';

interface UseInfiniteTransactionListProps {
  getScrollElement: () => HTMLDivElement | null;
}

export default function ({
  getScrollElement,
}: UseInfiniteTransactionListProps) {
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
  const transactionList = useMemo(
    () =>
      Object.entries(
        selectTransactionsByDate(pages?.flatMap((p) => p.transactions) || []),
      ).flat(2),
    [pages],
  );
  const infiniteTransactionVirtualizer = useVirtualizer({
    count: transactionList?.length,
    getScrollElement,
    estimateSize: (i) => (typeof transactionList[i] === 'string' ? 34 : 52),
    overscan: 5,
  });

  const items = useMemo(
    () => infiniteTransactionVirtualizer.getVirtualItems(),
    [infiniteTransactionVirtualizer],
  );

  useEffect(() => {
    const [lastRow] = items.reverse();

    if (!lastRow) {
      return;
    }

    if (
      lastRow.index === transactionList.length - 1 &&
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
    items,
    transactionList.length,
  ]);

  return {
    error,
    isInitialLoading,
    status,
    transactions: transactionList,
    virtualItems: infiniteTransactionVirtualizer.getVirtualItems(),
    virtualizer: infiniteTransactionVirtualizer,
  };
}
