import * as hl from '@nktkas/hyperliquid';
import { AbstractViemLocalAccount } from '@nktkas/hyperliquid/signing';
import type { Address, TypedDataDefinition } from 'viem';

import { getWallet, signTypedData } from '~/core/keychain';
import { KeychainType } from '~/core/types/keychainTypes';
import { wait } from '~/core/utils/time';
import { logger } from '~/logger';

const HYPERLIQUID_HOSTS = new Set(['app.hyperliquid.xyz']);
const RAINBOW_REFERRAL_CODE = 'RNBW';
const HYPERLIQUID_REFERRAL_POLL_INTERVAL_MS = 5000;
const HYPERLIQUID_REFERRAL_POLL_TIMEOUT_MS = 120000;

type HyperliquidReferralTerminalState =
  | 'already_referred'
  | 'success'
  | 'unsupported_wallet';

type HyperliquidReferralState =
  | { kind: 'idle' }
  | { kind: 'processing'; promise: Promise<void> }
  | { kind: 'terminal'; terminalState: HyperliquidReferralTerminalState };

type HyperliquidReferralAttemptResult = 'done' | 'retry';

const hlTransport = new hl.HttpTransport();
const infoClient = new hl.InfoClient({
  transport: hlTransport,
});

const referralStates = new Map<string, HyperliquidReferralState>();

const getAddressKey = (address: Address) => address.toLowerCase();

const getState = (address: Address): HyperliquidReferralState =>
  referralStates.get(getAddressKey(address)) ?? { kind: 'idle' };

const setState = (address: Address, state: HyperliquidReferralState) => {
  referralStates.set(getAddressKey(address), state);
};

const getAbstractWallet = (address: Address): AbstractViemLocalAccount => ({
  address,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signTypedData(params, _options) {
    return signTypedData({
      address,
      message: {
        type: 'sign_typed_data',
        data: params as unknown as TypedDataDefinition,
      },
    }) as Promise<`0x${string}`>;
  },
});

const runAttempt = async (
  address: Address,
): Promise<HyperliquidReferralAttemptResult> => {
  try {
    const wallet = await getWallet(address);
    if (
      !wallet ||
      wallet.type === KeychainType.ReadOnlyKeychain ||
      wallet.type === KeychainType.HardwareWalletKeychain
    ) {
      setState(address, {
        kind: 'terminal',
        terminalState: 'unsupported_wallet',
      });
      return 'done';
    }

    const check = await infoClient.preTransferCheck({
      user: address,
      source: address,
    });
    if (!check.userExists) {
      return 'retry';
    }

    const referral = await infoClient.referral({ user: address });
    if (referral.referredBy) {
      setState(address, {
        kind: 'terminal',
        terminalState: 'already_referred',
      });
      return 'done';
    }

    const exchangeClient = new hl.ExchangeClient({
      wallet: getAbstractWallet(address),
      transport: hlTransport,
    });
    await exchangeClient.setReferrer({ code: RAINBOW_REFERRAL_CODE });
    setState(address, { kind: 'terminal', terminalState: 'success' });
    return 'done';
  } catch (error) {
    logger.warn('Failed to ensure Hyperliquid referral', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 'retry';
  }
};

const runWorkflow = async ({
  address,
  poll,
}: {
  address: Address;
  poll: boolean;
}): Promise<void> => {
  const maxAttempts = poll
    ? Math.floor(
        HYPERLIQUID_REFERRAL_POLL_TIMEOUT_MS /
          HYPERLIQUID_REFERRAL_POLL_INTERVAL_MS,
      ) + 1
    : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // We want this code to run serially
    // eslint-disable-next-line no-await-in-loop
    const result = await runAttempt(address);
    if (result === 'done') {
      return;
    }

    if (attempt === maxAttempts - 1) {
      setState(address, { kind: 'idle' });
      return;
    }

    // We want this code to run serially
    // eslint-disable-next-line no-await-in-loop
    await wait(HYPERLIQUID_REFERRAL_POLL_INTERVAL_MS);
  }
};

export const isHyperliquidHost = (host: string) => HYPERLIQUID_HOSTS.has(host);

export const ensureHyperliquidReferral = async ({
  address,
  poll = false,
}: {
  address: Address;
  poll?: boolean;
}): Promise<void> => {
  const state = getState(address);

  if (state.kind === 'terminal') return;
  if (state.kind === 'processing') {
    const { promise } = state;
    await promise;
    if (!poll) {
      return;
    }
  }

  if (getState(address).kind !== 'idle') {
    return;
  }

  const promise = runWorkflow({ address, poll });
  setState(address, { kind: 'processing', promise });
  await promise;
};
