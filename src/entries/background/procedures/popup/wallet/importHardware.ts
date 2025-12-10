import { importHardwareWallet } from '~/core/keychain';

import { walletOs } from '../os';

export const importHardwareHandler = walletOs.importHardware.handler(
  async ({ input }) => {
    const address = await importHardwareWallet(input);
    // Status is now computed from keychain state, no need to set it explicitly
    return { address };
  },
);
