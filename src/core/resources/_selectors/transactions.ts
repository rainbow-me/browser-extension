import { groupBy } from 'lodash';

import { RainbowTransaction } from '~/core/types/transactions';
import { groupTransactionByDate } from '~/core/utils/dates';

export const selectTransactionsByDate = (
  transactions: RainbowTransaction[],
) => {
  const sortedTransactions = transactions.sort((tx1, tx2) => {
    if (tx1.pending && tx2.pending) return (tx2.nonce || 0) - (tx1.nonce || 0);
    if (tx1.pending || tx2.pending) return -1;

    if (!tx1.minedAt) return -1;
    if (!tx2.minedAt) return 1;

    return (tx2.minedAt || 0) - (tx1.minedAt || 0);
  });
  return groupBy(sortedTransactions, groupTransactionByDate);
};
