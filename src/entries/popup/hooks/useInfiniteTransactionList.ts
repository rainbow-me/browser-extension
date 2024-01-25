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
import { useBackendSupportedChains } from '~/core/utils/chains';

import useComponentWillUnmount from './useComponentWillUnmount';
import { useKeyboardShortcut } from './useKeyboardShortcut';

const PAGES_TO_CACHE_LIMIT = 2;

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

export const useInfiniteTransactionList = ({
  getScrollElement,
}: UseInfiniteTransactionListParams) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { pendingTransactions: storePendingTransactions } =
    usePendingTransactionsStore();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const pendingTransactions = useMemo(
    () => storePendingTransactions[address] || [],
    [address, storePendingTransactions],
  );
  const { customNetworkTransactions } = useCustomNetworkTransactionsStore();

  const currentAddressCustomNetworkTransactions = useMemo(
    () => Object.values(customNetworkTransactions[address] || {}).flat(),
    [address, customNetworkTransactions],
  );

  const { testnetMode } = useTestnetModeStore();

  const supportedChainIds = useBackendSupportedChains({ testnetMode }).map(
    ({ id }) => id,
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
    testnetMode,
  });

  const pages = data?.pages;
  const cutoff = pages?.length ? pages[pages.length - 1]?.cutoff : null;
  const transactions = useMemo(
    () => pages?.flatMap((p) => p.transactions) || [],
    [pages],
  );

  const transactionsAfterCutoff = useMemo(() => {
    const allTransactions = transactions.concat(
      currentAddressCustomNetworkTransactions,
    );
    if (!cutoff) return allTransactions;
    const cutoffIndex = allTransactions.findIndex(
      (tx) => tx.status !== 'pending' && tx.minedAt < cutoff,
    );
    if (!cutoffIndex || cutoffIndex === -1) return allTransactions;

    const transactionsAfterCutoff = [...allTransactions].slice(0, cutoffIndex);
    return transactionsAfterCutoff;
  }, [currentAddressCustomNetworkTransactions, cutoff, transactions]);

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
    getItemKey: (i) => {
      const txOrLabel = formattedTransactions[i];
      return typeof txOrLabel === 'string' ? txOrLabel : txOrLabel.hash;
    },
  });
  const rows = infiniteRowVirtualizer.getVirtualItems();

  const cleanupPages = useCallback(() => {
    if (data && data?.pages) {
      queryClient.setQueryData(
        consolidatedTransactionsQueryKey({
          address,
          currency,
          userChainIds: supportedChainIds,
          testnetMode,
        }),
        {
          ...data,
          pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT),
        },
      );
    }
  }, [address, currency, data, testnetMode, supportedChainIds]);

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
