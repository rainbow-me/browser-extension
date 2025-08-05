import { useSettingsStore } from '~/core/state/currentSettings/store';

import { usePoll } from './usePoll';
import { useWatchPendingTransactions } from './useWatchPendingTransactions';

const PENDING_TRANSACTION_POLLING_INTERVAL = 5000;

export function PendingTransactionWatcher() {
  const [address] = useSettingsStore('currentAddress');

  const { watchPendingTransactions } = useWatchPendingTransactions({ address });
  usePoll(watchPendingTransactions, PENDING_TRANSACTION_POLLING_INTERVAL);

  return null;
}
