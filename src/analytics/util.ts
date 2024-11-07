import { SupportedAlgorithm, computeHmac } from '@ethersproject/sha2';
import { Address } from 'viem';

import { RainbowError, logger } from '~/logger';

const SECURE_WALLET_HASH_KEY = process.env.SECURE_WALLET_HASH_KEY;

export function securelyHashWalletAddress(
  walletAddress: Address | undefined,
): string | undefined {
  if (!SECURE_WALLET_HASH_KEY) {
    logger.error(
      new RainbowError(
        `[securelyHashWalletAddress]: Required .env variable SECURE_WALLET_HASH_KEY does not exist`,
      ),
    );
    return;
  }

  if (!walletAddress) return;

  try {
    const hmac = computeHmac(
      SupportedAlgorithm.sha256,
      // must be hex `0x<key>` string
      SECURE_WALLET_HASH_KEY,
      // must be hex `0x<key>` string
      walletAddress,
    );

    logger.debug(`[securelyHashWalletAddress]: Wallet address securely hashed`);

    return hmac;
  } catch (e) {
    // could be an invalid hashing key, or trying to hash an ENS
    logger.error(
      new RainbowError(
        `[securelyHashWalletAddress]: Wallet address hashing failed`,
      ),
    );
  }
}
