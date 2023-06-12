import { useMemo } from 'react';
import { Address, useNetwork } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
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

export function useAllTransactions({
  address,
  currency,
}: {
  address?: Address;
  currency: SupportedCurrencyKey;
}) {
  const currentChain = useNetwork();
  const {
    data: confirmedTransactions,
    isInitialLoading: confirmedInitialLoading,
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

  const { getPendingTransactions } = usePendingTransactionsStore();
  const pendingTransactions: RainbowTransaction[] = getPendingTransactions({
    address,
  });
  const allTransactions = useMemo(
    () => [
      ...pendingTransactions,
      ...(confirmedTransactions || []),
      ...(confirmedArbitrumTransactions || []),
      ...(confirmedBscTransactions || []),
      ...(confirmedOptimismTransactions || []),
      ...(confirmedPolygonTransactions || []),
    ],
    [
      confirmedArbitrumTransactions,
      confirmedBscTransactions,
      confirmedOptimismTransactions,
      confirmedPolygonTransactions,
      confirmedTransactions,
      pendingTransactions,
    ],
  );

  const isInitialLoading =
    confirmedInitialLoading ||
    arbitrumInitialLoading ||
    bscInitialLoading ||
    optimismInitialLoading ||
    polygonInitialLoading;

  return useMemo(
    () => ({
      allTransactions,
      allTransactionsByDate: selectTransactionsByDate(allTransactions),
      isInitialLoading,
    }),
    [allTransactions, isInitialLoading],
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
