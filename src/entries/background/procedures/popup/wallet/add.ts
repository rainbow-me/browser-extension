import { addNewAccount } from '~/core/keychain';

import { walletOs } from '../os';

export const addHandler = walletOs.add.handler(async ({ input: sibling }) => {
  return await addNewAccount(sibling);
});
