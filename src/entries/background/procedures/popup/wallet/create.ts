import { createWallet } from '~/core/keychain';

import { walletOs } from '../os';

export const createHandler = walletOs.create.handler(async () => {
  const address = await createWallet();
  // Status is now computed from keychain state, no need to set it explicitly
  return { address };
});
