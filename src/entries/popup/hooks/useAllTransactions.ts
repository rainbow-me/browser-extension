import { Address } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import { selectTransactionsByDate } from '~/core/resources/_selectors';
import { useTransactions } from '~/core/resources/transactions/transactions';
import { usePendingTransactionsStore } from '~/core/state';
import { RainbowTransaction } from '~/core/types/transactions';

export function useAllTransactions({
  address,
  currency,
}: {
  address?: Address;
  currency: SupportedCurrencyKey;
}) {
  const { data: confirmedTransactions } = useTransactions({
    address,
    currency,
  });
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
