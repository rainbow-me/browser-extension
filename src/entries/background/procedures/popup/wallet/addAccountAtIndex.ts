import { addAccountAtIndex } from '~/core/keychain';

import { walletOs } from '../os';

export const addAccountAtIndexHandler = walletOs.addAccountAtIndex.handler(
  async ({ input: { siblingAddress, index, address } }) => {
    return await addAccountAtIndex(siblingAddress, index, address);
  },
);
