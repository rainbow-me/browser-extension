import { importWallet } from '~/core/keychain';
import { DuplicateAccountError } from '~/core/types/keychainTypes';

import { walletOs } from '../os';

export const importHandler = walletOs.import.handler(
  async ({ input: { seed }, errors }) => {
    try {
      const address = await importWallet(seed);

      return { address };
    } catch (e) {
      if (e instanceof DuplicateAccountError) {
        throw errors.DUPLICATE_ACCOUNT({
          message: `Duplicate account ${e.account}`,
          data: {
            address: e.account,
          },
        });
      }
      throw e;
    }
  },
);
