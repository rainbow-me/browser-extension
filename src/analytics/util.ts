import { ORPCError, isDefinedError, safe } from '@orpc/client';
import { Address, Hex, isHex } from 'viem';

import { KeychainType } from '~/core/types/keychainTypes';
import { KeychainWalletError } from '~/entries/background/contracts/popup/wallet/wallet';
import { getWallet } from '~/entries/popup/handlers/wallet';
import { RainbowError, logger } from '~/logger';

import { hmacSha256 } from './hash';

const SECURE_WALLET_HASH_KEY = process.env.SECURE_WALLET_HASH_KEY as
  | Hex
  | undefined;

if (!isHex(SECURE_WALLET_HASH_KEY)) {
  throw new Error('SECURE_WALLET_HASH_KEY is not a valid hex string');
}

function securelyHashWalletAddress(
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
    // Concatenate key and address bytes, then hash using sha256
    const hash = hmacSha256(SECURE_WALLET_HASH_KEY, walletAddress);
    logger.debug(`[securelyHashWalletAddress]: Wallet address securely hashed`);
    return hash;
  } catch (e) {
    // could be an invalid hashing key, or trying to hash an ENS
    logger.error(
      new RainbowError(
        `[securelyHashWalletAddress]: Wallet address hashing failed`,
      ),
    );
  }
}

export type WalletContext = {
  walletType?: 'owned' | 'hardware' | 'watched';
  walletAddressHash?: string;
};

export async function getWalletContext(
  address: Address,
): Promise<WalletContext> {
  // currentAddressStore address is initialized to ''
  if (!address || address === ('' as Address)) return {};

  const walletAddressHash = securelyHashWalletAddress(address);

  let walletType: WalletContext['walletType']; // unavailable when keychain is locked
  const [error, wallet] = await safe(getWallet(address));

  if (wallet) {
    walletType = (
      {
        [KeychainType.HdKeychain]: 'owned',
        [KeychainType.KeyPairKeychain]: 'owned',
        [KeychainType.ReadOnlyKeychain]: 'watched',
        [KeychainType.HardwareWalletKeychain]: 'hardware',
      } as const
    )[wallet.type];
  } else if (
    error &&
    !(
      error instanceof ORPCError &&
      isDefinedError(error) &&
      error.code === KeychainWalletError.KEYCHAIN_LOCKED
    )
  ) {
    // expect getWallet error only when keychain is locked
    logger.error(
      new RainbowError('Unhandled getWallet error', { cause: error }),
    );
  }

  return {
    walletType,
    walletAddressHash,
  };
}
