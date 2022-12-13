import { Address } from 'wagmi';

import { watchPendingTransactions } from '~/core/utils/transactions';

import { usePoll } from './usePoll';

const PENDING_TRANSACTION_POLLING_INTERVAL = 10000;

export function usePendingTransactionWatcher({
  address,
}: {
  address?: Address;
}) {
  usePoll(() => {
    if (address) {
      watchPendingTransactions({ address });
    }
  }, PENDING_TRANSACTION_POLLING_INTERVAL);
}
