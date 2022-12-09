import { ChainId } from '@rainbow-me/swaps';
import { Address } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import { useTransactions } from '~/core/resources/transactions/transactions';
import {
  currentAddressStore,
  nonceStore,
  pendingTransactionsStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { RainbowTransaction } from '~/core/types/transactions';

export function useAllTransactions({
  address,
  currency,
}: {
  address?: Address;
  currency: SupportedCurrencyKey;
}) {
  const { data: confirmedTransactions } = useTransactions(
    {
      address,
      currency,
    },
    {
      onSuccess: (transactions: RainbowTransaction[]) =>
        watchConfirmedTransactions(transactions),
    },
  );
  const { getPendingTransactions } = usePendingTransactionsStore();
  const pendingTransactions: RainbowTransaction[] = getPendingTransactions({
    address,
  })?.map((tx) => ({ ...tx, pending: true }));
  const allTransactions = pendingTransactions.concat(
    confirmedTransactions || [],
  );
  return {
    allTransactions,
    allTransactionsByDate: selectTransactionsByDate(allTransactions),
  };
}

function watchConfirmedTransactions(transactions: RainbowTransaction[]) {
  const { currentAddress } = currentAddressStore.getState();
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const { setNonce } = nonceStore.getState();
  const pendingTransactions = getPendingTransactions({
    address: currentAddress,
  });
  const latestTx = transactions?.[0];
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
    network: ChainId.mainnet,
    currentNonce,
    latestConfirmedNonce,
  });

  const updatedPendingTx = pendingTransactions?.filter(
    (tx) => (tx?.nonce || 0) > latestConfirmedNonce,
  );
  setPendingTransactions({
    address: currentAddress,
    pendingTransactions: updatedPendingTx,
  });
}
