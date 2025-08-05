import { addAccountAtIndex } from '~/core/keychain';

import { popupOs } from '../os';

export const addAccountAtIndexHandler =
  popupOs.wallet.addAccountAtIndex.handler(
    async ({ input: { siblingAddress, index, address } }) => {
      return await addAccountAtIndex(siblingAddress, index, address);
    },
  );
