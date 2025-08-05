import { addNewAccount } from '~/core/keychain';

import { popupOs } from '../os';

export const addHandler = popupOs.wallet.add.handler(
  async ({ input: sibling }) => {
    return await addNewAccount(sibling);
  },
);
