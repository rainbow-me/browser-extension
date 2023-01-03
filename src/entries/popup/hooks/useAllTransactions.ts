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
  const { data: confirmedTransactions } = useTransactions(
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
  const { data: confirmedArbitrumTransactions } = useTransactions(
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
  const { data: confirmedBscTransactions } = useTransactions(
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
  const { data: confirmedOptimismTransactions } = useTransactions(
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
  const { data: confirmedPolygonTransactions } = useTransactions(
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
  })?.map((tx) => ({ ...tx, pending: true }));
  const allTransactions = [
    ...pendingTransactions,
    ...(confirmedTransactions || []),
    ...(confirmedArbitrumTransactions || []),
    ...(confirmedBscTransactions || []),
    ...(confirmedOptimismTransactions || []),
    ...(confirmedPolygonTransactions || []),
  ];
  return {
    allTransactions,
    allTransactionsByDate: selectTransactionsByDate(allTransactions),
  };
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
  const latestPendingTx = pendingTransactions?.[0];

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
