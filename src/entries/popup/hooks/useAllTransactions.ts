import { useMemo, useState } from 'react';
import { Address, useNetwork } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { useTransactions } from '~/core/resources/transactions/transactions';
import {
  currentAddressStore,
  nonceStore,
  pendingTransactionsStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useAllTransactions({
  address,
  currency,
}: {
  address?: Address;
  currency: SupportedCurrencyKey;
}) {
  const [manuallyRefetching, setManuallyRefetching] = useState(false);
  const currentChain = useNetwork();
  const {
    data: confirmedTransactions,
    isInitialLoading: confirmedInitialLoading,
    refetch: refetchConfirmed,
  } = useTransactions(
    {
      address,
      chainId: ChainId.mainnet,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(
          transactions,
          currentChain?.chain?.id || ChainId.mainnet,
        ),
    },
  );
  const {
    data: confirmedArbitrumTransactions,
    isInitialLoading: arbitrumInitialLoading,
    refetch: refetchArbitrum,
  } = useTransactions(
    {
      address,
      chainId: ChainId.arbitrum,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.arbitrum),
    },
  );
  const {
    data: confirmedBscTransactions,
    isInitialLoading: bscInitialLoading,
    refetch: refetchBsc,
  } = useTransactions(
    {
      address,
      chainId: ChainId.bsc,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.bsc),
    },
  );
  const {
    data: confirmedOptimismTransactions,
    isInitialLoading: optimismInitialLoading,
    refetch: refetchOptimism,
  } = useTransactions(
    {
      address,
      chainId: ChainId.optimism,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.optimism),
    },
  );
  const {
    data: confirmedPolygonTransactions,
    isInitialLoading: polygonInitialLoading,
    refetch: refetchPolygon,
  } = useTransactions(
    {
      address,
      chainId: ChainId.polygon,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.polygon),
    },
  );
  const {
    data: confirmedBaseTransactions,
    isInitialLoading: baseInitialLoading,
    refetch: refetchBase,
  } = useTransactions(
    {
      address,
      chainId: ChainId.base,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.base),
    },
  );
  const {
    data: confirmedZoraTransactions,
    isInitialLoading: zoraInitialLoading,
    refetch: refetchZora,
  } = useTransactions(
    {
      address,
      chainId: ChainId.zora,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions, ChainId.zora),
    },
  );

  const refetchTransactions = async () => {
    setManuallyRefetching(true);
    const queries = [
      refetchArbitrum(),
      refetchBsc(),
      refetchConfirmed(),
      refetchOptimism(),
      refetchPolygon(),
      refetchBase(),
      refetchZora(),
    ];
    await Promise.all(queries);
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

  const { getPendingTransactions } = usePendingTransactionsStore();
  const pendingTransactions: RainbowTransaction[] = getPendingTransactions({
    address,
  });

  const isInitialLoading =
    confirmedInitialLoading ||
    arbitrumInitialLoading ||
    bscInitialLoading ||
    optimismInitialLoading ||
    polygonInitialLoading ||
    baseInitialLoading ||
    zoraInitialLoading ||
    manuallyRefetching;

  return useMemo(
    () => ({
      allTransactions: [
        ...pendingTransactions,
        ...(confirmedTransactions || []),
        ...(confirmedArbitrumTransactions || []),
        ...(confirmedBscTransactions || []),
        ...(confirmedOptimismTransactions || []),
        ...(confirmedPolygonTransactions || []),
        ...(confirmedBaseTransactions || []),
        ...(confirmedZoraTransactions || []),
      ],
      isInitialLoading,
    }),
    [
      confirmedArbitrumTransactions,
      confirmedBscTransactions,
      confirmedOptimismTransactions,
      confirmedPolygonTransactions,
      confirmedBaseTransactions,
      confirmedZoraTransactions,
      confirmedTransactions,
      pendingTransactions,
      isInitialLoading,
    ],
  );
}

function watchConfirmedTransactions(
  transactions: RainbowTransaction[],
  currentChainId: ChainId,
) {
  const { currentAddress } = currentAddressStore.getState();
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const { setNonce } = nonceStore.getState();
  const pendingTransactions = getPendingTransactions({
    address: currentAddress,
  });

  const txSortedByDescendingNonce = transactions
    .filter((tx) => {
      return isLowerCaseMatch(tx?.from, currentAddress);
    })
    .sort(({ nonce: n1 }, { nonce: n2 }) => (n2 ?? 0) - (n1 ?? 0));
  const latestTx = txSortedByDescendingNonce?.[0];
  const latestConfirmedNonce = latestTx?.nonce || 0;
  let currentNonce: number;
  const latestPendingTx = pendingTransactions?.filter(
    (tx) => tx?.chainId === currentChainId,
  )?.[0];

  if (latestPendingTx) {
    const latestPendingNonce = latestPendingTx?.nonce || 0;
    currentNonce =
      latestPendingNonce > latestConfirmedNonce
        ? latestPendingNonce
        : latestConfirmedNonce;
  } else {
    currentNonce = latestConfirmedNonce;
  }

  setNonce({
    address: currentAddress,
    chainId: currentChainId,
    currentNonce,
    latestConfirmedNonce,
  });

  const updatedPendingTx = pendingTransactions?.filter((tx) => {
    if (tx?.chainId !== currentChainId) {
      return true;
    }
    // remove pending tx because backend is now returning full tx data
    if ((tx?.nonce || 0) <= latestConfirmedNonce) {
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
