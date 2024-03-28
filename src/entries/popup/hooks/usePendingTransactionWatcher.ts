import { type Address } from 'viem';

import { usePoll } from './usePoll';
import { useWatchPendingTransactions } from './useWatchPendingTransactions';

const PENDING_TRANSACTION_POLLING_INTERVAL = 5000;

export function usePendingTransactionWatcher({
  address,
}: {
  address: Address;
}) {
  const { watchPendingTransactions } = useWatchPendingTransactions({ address });
  usePoll(watchPendingTransactions, PENDING_TRANSACTION_POLLING_INTERVAL);
}
