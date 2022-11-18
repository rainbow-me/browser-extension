import { groupBy } from 'lodash';

import { RainbowTransaction } from '~/core/types/transactions';
import { groupTransactionByDate } from '~/core/utils/dates';

export const selectTransactionsByDate = (
  transactions: RainbowTransaction[],
) => {
  return groupBy(transactions, groupTransactionByDate);
};
