import { useCallback } from 'react';
import { Address } from 'wagmi';

import { watchPendingTransactions } from '~/core/utils/txWatcher';

import { usePoll } from './usePoll';

const PENDING_TRANSACTION_POLLING_INTERVAL = 10000;

export function usePendingTransactionWatcher({
  address,
}: {
  address?: Address;
}) {
  const callback = useCallback(() => {
    if (address) {
      watchPendingTransactions({ address });
    }
  }, [address]);
  usePoll(callback, PENDING_TRANSACTION_POLLING_INTERVAL);
}
