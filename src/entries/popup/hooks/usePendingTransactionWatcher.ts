import { Address } from 'wagmi';

import { useWatchPendingTransactions } from '~/core/utils/transactions';

import { usePoll } from './usePoll';

const PENDING_TRANSACTION_POLLING_INTERVAL = 10000;

export function usePendingTransactionWatcher({
  address,
}: {
  address?: Address;
}) {
  const { watchPendingTransactions } = useWatchPendingTransactions({ address });
  usePoll(watchPendingTransactions, PENDING_TRANSACTION_POLLING_INTERVAL);
}
