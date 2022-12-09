import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import { useTransactions } from '~/core/resources/transactions/transactions';
import {
  //   currentAddressStore,
  //   pendingTransactionsStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { RainbowTransaction } from '~/core/types/transactions';
import { newTestTx } from '~/core/utils/transactions';

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
      onSuccess: (d) => watchPendingTransactions(d),
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

async function watchPendingTransactions(d) {
  //   const { currentAddress } = currentAddressStore.getState();
  //   const { getPendingTransactions } = pendingTransactionsStore.getState();
  //   const pendingTransactions = getPendingTransactions({
  //     address: currentAddress,
  //   });
  try {
    const provider = getProvider({ chainId: ChainId.mainnet });
    const tx = d?.[0];
    console.log('TX: ', tx);
    const hash = getHash(tx);
    console.log('HASH: ', hash);
    if (hash) {
      const txFromChain = await provider.getTransaction(hash);
      console.log('TEST TX: ', newTestTx);
      console.log('TX FROM CHAIN: ', txFromChain);
    }
  } catch (e) {
    console.log();
  }
}

function getHash(tx: RainbowTransaction) {
  return tx?.hash?.split('-').shift();
}
