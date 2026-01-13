import { importWallet } from '~/core/keychain';

import { walletOs } from '../os';

export const importHandler = walletOs.import.handler(
  async ({ input: { seed } }) => {
    const address = await importWallet(seed);
    // Status is now computed from keychain state, no need to set it explicitly
    return { address };
  },
);
