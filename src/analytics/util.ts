import { SupportedAlgorithm, computeHmac } from '@ethersproject/sha2';
import { Address } from 'viem';

import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { KeychainType } from '~/core/types/keychainTypes';
import { getWallet } from '~/entries/popup/handlers/wallet';
import { RainbowError, logger } from '~/logger';

import { analytics } from '.';

const SECURE_WALLET_HASH_KEY = process.env.SECURE_WALLET_HASH_KEY;

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

  // walletType is unavailable when keychain is locked
  let walletType;
  try {
    // expect getWallet error when keychain is locked
    const wallet = await getWallet(address);
    walletType = (
      {
        [KeychainType.HdKeychain]: 'owned',
        [KeychainType.KeyPairKeychain]: 'owned',
        [KeychainType.ReadOnlyKeychain]: 'watched',
        [KeychainType.HardwareWalletKeychain]: 'hardware',
      } as const
    )[wallet?.type];
  } catch (e: unknown) {
    logger.error(
      new RainbowError(`[getWalletContext]: Wallet address hashing failed`, {
        cause: e,
      }),
    );
  }

  return {
    walletType,
    walletAddressHash,
  };
}

/**
 * Track favorite asset-related events
 */
export const trackFavorite = (
  address: AddressOrEth,
  chainId: ChainId,
  isAdding: boolean,
  favoritesLength: number,
) => {
  analytics.track(
    isAdding
      ? analytics.event.tokenFavorited
      : analytics.event.tokenUnfavorited,
    {
      token: { address, chainId },
      favorites: { favoritesLength },
    },
  );
};

/**
 * Track hidden asset-related events
 */
export const trackHiddenAsset = (
  address: string,
  chainId: ChainId,
  isHidden: boolean,
  totalHidden: number,
) => {
  analytics.track(
    isHidden ? analytics.event.assetHidden : analytics.event.assetUnhidden,
    {
      token: { address, chainId },
      hiddenAssets: { totalHidden },
    },
  );
};
