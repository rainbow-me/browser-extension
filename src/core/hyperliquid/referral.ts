import * as hl from '@nktkas/hyperliquid';
import { AbstractViemLocalAccount } from '@nktkas/hyperliquid/signing';
import type { Address } from 'viem';

import { getWallet, signTypedData } from '~/core/keychain';
import { KeychainType } from '~/core/types/keychainTypes';

const HYPERLIQUID_HOSTS = new Set(['app.hyperliquid.xyz']);
const RAINBOW_REFERRAL_CODE = 'RNBW';
const RETRY_DELAY_MS = 5000;

const hlTransport = new hl.HttpTransport();
const infoClient = new hl.InfoClient({
  transport: hlTransport,
});

const pendingReferralChecks = new Map<string, ReturnType<typeof setTimeout>>();

const userExistsOnHyperliquid = async (address: Address) => {
  const check = await infoClient.preTransferCheck({
    user: address,
    source: address,
  });
  return check.userExists ?? false;
};

const getAbstractWallet = (address: Address): AbstractViemLocalAccount => {
  return {
    address,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signTypedData(params, _options) {
      return signTypedData({
        address,
        msgData: params,
      }) as Promise<`0x${string}`>;
    },
  };
};

export const isHyperliquidHost = (host: string) => HYPERLIQUID_HOSTS.has(host);

export const ensureHyperliquidReferral = async ({
  address,
}: {
  address: Address;
}): Promise<void> => {
  console.log('ensureHyperliquidReferral', address);
  try {
    const wallet = await getWallet(address);
    if (
      !wallet ||
      wallet.type === KeychainType.ReadOnlyKeychain ||
      wallet.type === KeychainType.HardwareWalletKeychain
    ) {
      return;
    }

    const userExists = await userExistsOnHyperliquid(address);
    if (!userExists) {
      console.log('user does not exist on Hyperliquid', address);
      return;
    }

    const referral = await infoClient.referral({ user: address });
    if (referral.referredBy) {
      console.log('user already has a referral', address);
      return;
    }

    const exchangeClient = new hl.ExchangeClient({
      wallet: getAbstractWallet(address),
      transport: hlTransport,
    });

    await exchangeClient.setReferrer({ code: RAINBOW_REFERRAL_CODE });
    console.log('setReferrer success', referral);
  } catch (error) {
    console.warn('Failed to ensure Hyperliquid referral', error);
  }
};

export const scheduleHyperliquidReferralRetry = ({
  address,
  delayMs = RETRY_DELAY_MS,
}: {
  address: Address;
  delayMs?: number;
}) => {
  // try 1
  void ensureHyperliquidReferral({ address });

  // retry after 5s to set after signing and account creation
  const key = address.toLowerCase();
  const existingTimeout = pendingReferralChecks.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const timeout = setTimeout(() => {
    pendingReferralChecks.delete(key);
    void ensureHyperliquidReferral({ address });
  }, delayMs);

  pendingReferralChecks.set(key, timeout);
};
