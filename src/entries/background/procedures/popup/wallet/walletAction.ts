import { executeRap, signTypedData } from '~/core/keychain';
import { SignTypedDataArguments } from '~/core/types/messageSigning';
import { logger } from '~/logger';

import { walletOs } from '../os';

export const walletActionHandler = walletOs.walletAction.handler(
  async ({ input }) => {
    const { action, payload } = input;

    switch (action) {
      case 'execute_rap': {
        const result = await executeRap(payload);
        return { action, result };
      }

      case 'sign_typed_data': {
        const result = await signTypedData(payload as SignTypedDataArguments);
        return { action, result };
      }

      default: {
        logger.warn(`Unknown wallet action: ${action}`);
        throw new Error(`Unknown action: ${action}`);
      }
    }
  },
);
