import { shouldRevokeDelegation as sdkShouldRevokeDelegation } from '@rainbow-me/delegation';
import { Address } from 'viem';

import { canUseDelegation } from '~/core/viem/walletClient';
import { RainbowError, logger } from '~/logger';

import { walletOs } from '../os';

const EMPTY_RESULT = { shouldRevoke: false as const, revokes: [] };

export const shouldRevokeDelegationHandler =
  walletOs.shouldRevokeDelegation.handler(
    async ({ input: { userAddress } }) => {
      try {
        // HW and read-only wallets can't use delegation
        const canUse = await canUseDelegation(userAddress);
        if (!canUse) {
          return EMPTY_RESULT;
        }

        const result = await sdkShouldRevokeDelegation({
          address: userAddress,
        });
        return {
          shouldRevoke: result.shouldRevoke,
          revokes: result.revokes.map((r) => ({
            address: r.address as Address,
            chainId: r.chainId,
          })),
        };
      } catch (e) {
        logger.error(new RainbowError('shouldRevokeDelegation: check failed'), {
          message: e instanceof Error ? e.message : String(e),
        });
        return EMPTY_RESULT;
      }
    },
  );
