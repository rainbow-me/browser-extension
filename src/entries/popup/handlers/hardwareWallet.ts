/**
 * Unified Hardware Wallet Handler
 *
 * Provides a unified interface for Ledger and Trezor hardware wallets.
 * Uses viem-hw under the hood but abstracts away vendor-specific details.
 */

import type { BigNumberish } from '@ethersproject/bignumber';
import { TransactionRequest } from '@ethersproject/providers';
import { Address, Hash, Hex } from 'viem';
import {
  DeviceLockedError,
  DeviceNotFoundError,
  type HardwareWalletAccount,
  UserRejectedError,
} from 'viem-hw';
import { createLedgerAccount } from 'viem-hw/ledger';
import { createTrezorAccount } from 'viem-hw/trezor';

import { i18n } from '~/core/languages';
import {
  SigningMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

import { popupClient } from './background';

export type HardwareWalletVendor = 'Ledger' | 'Trezor';

/**
 * Get the derivation path for an address
 */
async function getPath(
  address: Address,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _vendor: HardwareWalletVendor,
): Promise<`m/${string}`> {
  const path = await popupClient.wallet.path(address);
  return path as `m/${string}`;
}

const toBigInt = (v: BigNumberish | undefined): bigint | undefined =>
  v != null ? BigInt(v.toString()) : undefined;

const toNumber = (v: BigNumberish | undefined): number | undefined =>
  v != null ? Number(v.toString()) : undefined;

const toViemTransaction = (tx: TransactionRequest) =>
  tx.gasPrice
    ? ({
        type: 'legacy' as const,
        chainId: tx.chainId ?? 1,
        data: tx.data as `0x${string}` | undefined,
        gas: toBigInt(tx.gasLimit),
        nonce: toNumber(tx.nonce),
        to: tx.to as Address | undefined,
        value: toBigInt(tx.value) ?? 0n,
        gasPrice: toBigInt(tx.gasPrice),
      } as const)
    : ({
        type: 'eip1559' as const,
        chainId: tx.chainId ?? 1,
        data: tx.data as `0x${string}` | undefined,
        gas: toBigInt(tx.gasLimit),
        nonce: toNumber(tx.nonce),
        to: tx.to as Address | undefined,
        value: toBigInt(tx.value) ?? 0n,
        maxFeePerGas: toBigInt(tx.maxFeePerGas),
        maxPriorityFeePerGas: toBigInt(tx.maxPriorityFeePerGas),
      } as const);

/**
 * Create a hardware wallet account for the given vendor
 */
async function createAccount(
  vendor: HardwareWalletVendor,
  path: string,
): Promise<HardwareWalletAccount> {
  const derivationPath = path as `m/${string}`;
  if (vendor === 'Ledger') {
    return createLedgerAccount({ path: derivationPath });
  } else {
    return createTrezorAccount({
      path: derivationPath,
      email: 'rainbow@rainbow.me',
      appUrl: 'https://rainbow.me',
    });
  }
}

/**
 * Sign a transaction with a hardware wallet
 */
export async function signTransactionFromHW(
  transaction: TransactionRequest,
  vendor: HardwareWalletVendor,
): Promise<Hex> {
  const { from: address } = transaction;
  const path = await getPath(address as Address, vendor);
  const account = await createAccount(vendor, path);

  const viemTx = toViemTransaction(transaction);
  return account.signTransaction(viemTx);
}

/**
 * Send a transaction with a hardware wallet
 */
export async function sendTransactionFromHW(
  transaction: TransactionRequest,
  vendor: HardwareWalletVendor,
): Promise<Hash> {
  const serializedTransaction = await signTransactionFromHW(
    transaction,
    vendor,
  );
  const client = getViemClient({ chainId: transaction.chainId });
  return client.sendRawTransaction({ serializedTransaction });
}

/**
 * Sign a message with a hardware wallet
 */
export async function signMessageByTypeFromHW(
  message: SigningMessage,
  address: Address,
  vendor: HardwareWalletVendor,
): Promise<Hex> {
  const path = await getPath(address, vendor);
  const account = await createAccount(vendor, path);

  if (isPersonalSignMessage(message)) {
    return account.signMessage({ message: message.message });
  } else if (isTypedDataMessage(message)) {
    return account.signTypedData(message.data);
  } else {
    throw new Error('Unsupported message type');
  }
}

/**
 * Handle hardware wallet errors with appropriate user alerts
 */
export function handleHWError(e: Error, vendor: HardwareWalletVendor) {
  const isLedger = vendor === 'Ledger';

  if (e instanceof DeviceLockedError) {
    if (isLedger) {
      alert(i18n.t('hw.ledger_locked_error'));
    } else {
      alert('Please make sure your Trezor is unlocked');
    }
  } else if (e instanceof DeviceNotFoundError) {
    if (isLedger) {
      alert(i18n.t('hw.check_ledger_disconnected'));
    } else {
      alert('Trezor device not found');
    }
  } else if (e instanceof UserRejectedError) {
    // User rejected - don't show alert
  } else if (e?.message) {
    alert(e.message);
  } else {
    logger.error(new RainbowError(`hw error (${vendor})`, { cause: e }));
    alert(`Error signing with ${vendor}`);
  }
}

/**
 * Show disconnected alert if needed
 */
export const showDisconnectedAlertIfNeeded = (e: unknown) => {
  if (e instanceof DeviceNotFoundError) {
    alert(i18n.t('hw.check_ledger_disconnected'));
  }
};

/**
 * Alias for showDisconnectedAlertIfNeeded (for backward compatibility)
 */
export const showLedgerDisconnectedAlertIfNeeded =
  showDisconnectedAlertIfNeeded;

/**
 * Check if error is a connection error
 */
export const isConnectionError = (e: unknown) => {
  return e instanceof DeviceNotFoundError || e instanceof DeviceLockedError;
};

/**
 * Alias for isConnectionError (for backward compatibility)
 */
export const isLedgerConnectionError = isConnectionError;
