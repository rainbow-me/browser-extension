import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { queryClient } from '~/core/react-query';
import { shortcuts } from '~/core/references/shortcuts';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import {
  consolidatedTransactionsQueryKey,
  useConsolidatedTransactions,
} from '~/core/resources/transactions/consolidatedTransactions';
import {
  nonceStore,
  pendingTransactionsStore,
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { ChainId } from '~/core/types/chains';
import {
  PendingTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';
import { getSupportedChainIds } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { chainIdMap } from '~/core/utils/userChains';

import useComponentWillUnmount from './useComponentWillUnmount';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useUserChains } from './useUserChains';

const PAGES_TO_CACHE_LIMIT = 2;

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

export default function ({
  getScrollElement,
}: UseInfiniteTransactionListParams) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { chains } = useUserChains();
  const { getPendingTransactions } = usePendingTransactionsStore();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const pendingTransactions = getPendingTransactions({ address });
  const { customNetworkTransactions } = useCustomNetworkTransactionsStore();

  const currentAddressCustomNetworkTransactions = useMemo(
    () => Object.values(customNetworkTransactions[address] || {}).flat(),
    [address, customNetworkTransactions],
  );

  const chainsToInclude = chains
    .map((chain) => chainIdMap[chain.id] || chain.id)
    .flat();

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
    { address, currency },
    {
      select: (data) => {
        let prevCutoff = Infinity;
        const selectedPages = data.pages.map((page) => {
          const customNetworkTransactionsForPage =
            currentAddressCustomNetworkTransactions.filter(
              (transaction) =>
                transaction.minedAt > (page?.cutoff || 0) &&
                transaction.minedAt < prevCutoff &&
                chainsToInclude.includes(transaction.chainId),
            );
          prevCutoff = page.cutoff || prevCutoff;
          return {
            ...page,
            transactions: page.transactions
              .filter((transaction) => {
                return chainsToInclude.includes(transaction.chainId);
              })
              .concat(customNetworkTransactionsForPage),
          };
        });
        return {
          ...data,
          pages: selectedPages,
        };
      },
      onSuccess: (data) => {
        if (data?.pages) {
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
            pendingTransactions,
            latestTransactions,
          });
        }
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
        consolidatedTransactionsQueryKey({ address, currency }),
        {
          ...data,
          pages: [...data.pages].slice(0, PAGES_TO_CACHE_LIMIT),
        },
      );
    }
  }, [address, currency, data]);

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
}

function watchForPendingTransactionsReportedByRainbowBackend({
  currentAddress,
  pendingTransactions,
  latestTransactions,
}: {
  currentAddress: Address;
  pendingTransactions: PendingTransaction[];
  latestTransactions: Map<ChainId, RainbowTransaction | null>;
}) {
  const { setNonce } = nonceStore.getState();
  const { setPendingTransactions } = pendingTransactionsStore.getState();
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
