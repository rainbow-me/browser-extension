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
    chainId: ChainId.mainnet,
    currentNonce,
    latestConfirmedNonce,
  });

  const updatedPendingTx = pendingTransactions?.filter((tx) => {
    // we do not filter L2 txs here because we do not have L2 transaction history
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
