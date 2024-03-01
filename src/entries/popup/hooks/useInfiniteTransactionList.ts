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

  const formattedTransactions = useMemo(() => {
    // filter out "pending transactions" that are already confirmed
    return Object.entries(
      selectTransactionsByDate([
        ...pendingTransactions.filter(
          (ptx) => !transactionsAfterCutoff.some((tx) => tx.hash === ptx.hash),
        ),
        ...transactionsAfterCutoff,
      ]),
    ).flat(2);
  }, [pendingTransactions, transactionsAfterCutoff]);

  const infiniteRowVirtualizer = useVirtualizer({
    count: formattedTransactions?.length,
    getScrollElement,
    estimateSize: (i) =>
      typeof formattedTransactions[i] === 'string' ? 34 : 52,
    overscan: 20,
    getItemKey: (i) => {
      const txOrLabel = formattedTransactions[i];
      // if (typeof txOrLabel != 'string' && txOrLabel.status === 'pending') {
      //   console.log(txOrLabel);
      // }
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

// {
//   "asset": {
//       "address": "0x44709a920fccf795fbc57baa433cc3dd53c44dbe",
//       "uniqueId": "0x44709a920fccf795fbc57baa433cc3dd53c44dbe_1",
//       "chainId": 1,
//       "chainName": "mainnet",
//       "mainnetAddress": "0x44709a920fccf795fbc57baa433cc3dd53c44dbe",
//       "isNativeAsset": false,
//       "native": {
//           "balance": {
//               "amount": "68.6150223759",
//               "display": "$68.62"
//           },
//           "price": {
//               "change": "5.25%",
//               "amount": 0.0078895047,
//               "display": "$0.01"
//           }
//       },
//       "name": "DappRadar",
//       "price": {
//           "value": 0.0078895047,
//           "changed_at": 1709317205,
//           "relative_change_24h": 5.248798967776636
//       },
//       "symbol": "RADAR",
//       "decimals": 18,
//       "icon_url": "https://rainbowme-res.cloudinary.com/image/upload/v1654697478/assets/ethereum/0x44709a920fccf795fbc57baa433cc3dd53c44dbe.png",
//       "colors": {
//           "primary": "#0068F8",
//           "fallback": "#95C3F3"
//       },
//       "networks": {
//           "1": {
//               "address": "0x44709a920fccf795fbc57baa433cc3dd53c44dbe",
//               "decimals": 18
//           },
//           "42161": {
//               "address": "0x28d32f80af227fc6a323f0b2ca213212797e3097",
//               "decimals": 18
//           }
//       },
//       "bridging": {
//           "isBridgeable": false,
//           "networks": {
//               "42161": {
//                   "bridgeable": false
//               }
//           }
//       },
//       "balance": {
//           "amount": "8697",
//           "display": "8,697.00 RADAR"
//       },
//       "smallBalance": false
//   },
//   "data": "0x095ea7b300000000000000000000000000000000009726632680fb29d3f7a9734e3010e2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
//   "value": "0",
//   "changes": [],
//   "from": "0x507F0daA42b215273B8a063B092ff3b6d27767aF",
//   "to": "0x44709a920fCcF795fbC57BAA433cc3dd53C44DbE",
//   "hash": "0x5719786809923ffcbe36b5ed9d0d63028072f2c906dcc1b08ba35d8d61cca8bc",
//   "chainId": 1,
//   "nonce": 225,
//   "status": "pending",
//   "type": "send",
//   "approvalAmount": "UNLIMITED",
//   "maxPriorityFeePerGas": "0x3b9aca00",
//   "maxFeePerGas": "0xee6b2800",
//   "title": "Sending",
//   "description": "DappRadar",
//   "feeType": "eip-1559"
// }
