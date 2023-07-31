import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useState } from 'react';
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
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { SUPPORTED_CHAIN_IDS } from '~/core/utils/chains';

import { useKeyboardShortcut } from './useKeyboardShortcut';

const PAGES_TO_CACHE_LIMIT = 2;

interface UseInfiniteTransactionListParams {
  getScrollElement: () => HTMLDivElement | null;
}

export default function ({
  getScrollElement,
}: UseInfiniteTransactionListParams) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { getPendingTransactions } = usePendingTransactionsStore();
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const pendingTransactions = getPendingTransactions({ address });

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
      onSuccess: (data) => {
        if (data?.pages) {
          const latestTransactions = data.pages
            .map((p) => p.transactions)
            .flat()
            .reduce((latestTxMap, currentTx) => {
              const currentChain = currentTx?.chainId;
              if (currentChain) {
                const latestTx = latestTxMap.get(currentChain);
                if (!latestTx) {
                  latestTxMap.set(currentChain, currentTx);
                }
              }
              return latestTxMap;
            }, new Map(SUPPORTED_CHAIN_IDS.map((chain) => [chain, null as RainbowTransaction | null])));
          watchConfirmedTransactions({
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
      (tx) => (tx.minedAt || Infinity) < cutoff,
    );
    if (!cutoffIndex) return transactions;
    return [...transactions].slice(0, cutoffIndex);
  }, [cutoff, transactions]);
  const formattedTransactions = useMemo(
    () =>
      Object.entries(
        selectTransactionsByDate(
          pendingTransactions.concat(transactionsAfterCutoff),
        ),
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

function watchConfirmedTransactions({
  currentAddress,
  pendingTransactions,
  latestTransactions,
}: {
  currentAddress: Address;
  pendingTransactions: RainbowTransaction[];
  latestTransactions: Map<ChainId, RainbowTransaction | null>;
}) {
  const { setNonce } = nonceStore.getState();
  const { setPendingTransactions } = pendingTransactionsStore.getState();

  for (const supportedChainId of SUPPORTED_CHAIN_IDS) {
    const latestTxConfirmedByBackend = latestTransactions.get(supportedChainId);
    if (!latestTxConfirmedByBackend) return;
    const latestNonceConfirmedByBackend = latestTxConfirmedByBackend.nonce || 0;
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

  const updatedPendingTx = pendingTransactions?.filter((tx) => {
    const { chainId, nonce } = tx;
    const latestConfirmedNonce = latestTransactions.get(chainId)?.nonce || 0;
    // remove pending tx because backend is now returning full tx data
    if ((nonce || 0) <= latestConfirmedNonce) {
      return false;
    }
    // either still pending or backend is not returning confirmation yet
    return true;
  });

  setPendingTransactions({
    address: currentAddress,
    pendingTransactions: updatedPendingTx,
  });
}
