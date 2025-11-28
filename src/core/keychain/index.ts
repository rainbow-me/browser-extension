import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import {
  SignTypedDataVersion,
  signTypedData as signTypedDataSigUtil,
} from '@metamask/eth-sig-util';
import { Address, Hex } from 'viem';
import { signTypedData as viemSignTypedData } from 'viem/accounts';

/* eslint-disable boundaries/element-types */
import {
  getMessageContent,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import type {
  SignMessageArguments,
  SignTypedDataArguments,
} from '~/entries/background/handlers/handleWallets';
import { logger } from '~/logger';
/* eslint-enable boundaries/element-types */

import { walletExecuteRap } from '../raps/execute';
import { RapSwapActionParameters, RapTypes } from '../raps/references';
import {
  getAtomicSwapsEnabled,
  getDelegationEnabled,
} from '../resources/delegations/featureStatus';
import { DuplicateAccountError, KeychainType } from '../types/keychainTypes';
import { EthereumWalletType } from '../types/walletTypes';
import {
  EthereumWalletSeed,
  identifyWalletType,
  normalizeTransactionResponsePayload,
  sanitizeTypedData,
} from '../utils/ethereum';
import { addHexPrefix } from '../utils/hex';
import { getViemClient } from '../viem/clients';

import { PrivateKey } from './IKeychain';
import { keychainManager } from './KeychainManager';
import type { HardwareWalletVendor } from './keychainTypes/hardwareWalletKeychain';
import { SerializedKeypairKeychain } from './keychainTypes/keyPairKeychain';

export const setVaultPassword = async (
  password: string,
  newPassword: string,
) => {
  if (!verifyPassword(password)) {
    throw new Error('Invalid password');
  }
  return keychainManager.setPassword(newPassword);
};

export const verifyPassword = (password: string) => {
  return keychainManager.verifyPassword(password);
};

export const unlockVault = async (password: string) => {
  try {
    await keychainManager.unlock(password);
    return keychainManager.state.isUnlocked;
  } catch (e) {
    return false;
  }
};

export const wipeVault = async () => {
  return keychainManager.wipe();
};

export const lockVault = () => {
  return keychainManager.lock();
};
export const hasVault = async () => {
  const keychainState =
    keychainManager.state.keychains.length > 0 || keychainManager.state.vault;
  if (keychainState) {
    return true;
  } else {
    // fallback to check storage in case rehydration failed
    return keychainManager.hasVaultInStorage();
  }
};

export const isPasswordSet = async () => {
  if (await keychainManager.verifyPassword('')) {
    return false;
  }
  return true;
};

export const isVaultUnlocked = (): boolean => {
  return keychainManager.state.isUnlocked;
};

export const isInitialized = (): boolean => {
  return keychainManager.state.initialized;
};

export const createWallet = async (): Promise<Address> => {
  const keychain = await keychainManager.addNewKeychain();
  const accounts = await keychain.getAccounts();
  return accounts[0];
};

export const isMnemonicInVault = async (mnemonic: EthereumWalletSeed) => {
  return keychainManager.isMnemonicInVault(mnemonic);
};

export const deriveAccountsFromSecret = async (
  secret: EthereumWalletSeed,
): Promise<Address[]> => {
  const walletType = identifyWalletType(secret);
  let accounts = [];
  switch (walletType) {
    case EthereumWalletType.mnemonic: {
      accounts = await keychainManager.deriveAccounts({
        type: KeychainType.HdKeychain,
        mnemonic: secret,
      });
      break;
    }
    case EthereumWalletType.privateKey: {
      accounts = await keychainManager.deriveAccounts({
        type: KeychainType.KeyPairKeychain,
        privateKey: secret as PrivateKey,
      });
      break;
    }
    case EthereumWalletType.readOnly: {
      accounts = await keychainManager.deriveAccounts({
        type: KeychainType.ReadOnlyKeychain,
        address: secret as Address,
      });
      break;
    }
    default:
      throw new Error('Wallet type not recognized.');
  }
  return accounts as Address[];
};

export const importHardwareWallet = async ({
  vendor,
  deviceId,
  wallets,
  accountsEnabled,
}: {
  vendor: HardwareWalletVendor;
  deviceId: string;
  wallets: Array<{ address: Address; index: number; hdPath?: string }>;
  accountsEnabled: number;
}) => {
  const keychain = await keychainManager.importKeychain({
    vendor,
    type: KeychainType.HardwareWalletKeychain,
    deviceId,
    wallets,
    accountsEnabled,
  });
  const accounts = await keychain.getAccounts();
  return accounts[0];
};

export const importWallet = async (
  secret: EthereumWalletSeed,
): Promise<Address> => {
  const walletType = identifyWalletType(secret);
  switch (walletType) {
    case EthereumWalletType.mnemonic: {
      const keychain = await keychainManager.importKeychain({
        type: KeychainType.HdKeychain,
        mnemonic: secret,
      });
      const address = (await keychain.getAccounts())[0];
      return address;
    }
    case EthereumWalletType.privateKey: {
      const opts: SerializedKeypairKeychain = {
        type: KeychainType.KeyPairKeychain,
        privateKey: secret as PrivateKey,
      };
      const newAccount = (await keychainManager.deriveAccounts(opts))[0];
      const existingAccounts = await keychainManager.getAccounts();

      // Check if account already exists before importing
      if (existingAccounts.includes(newAccount)) {
        const existingKeychain = await keychainManager.getKeychain(newAccount);
        // If it's a ReadOnlyKeychain, we can override it with the private key
        if (existingKeychain.type !== KeychainType.ReadOnlyKeychain) {
          throw new DuplicateAccountError(newAccount);
        }
      }

      const keychain = await keychainManager.importKeychain(opts);
      // Return the derived address (could have been elevated to hd while importing)
      const accounts = await keychain.getAccounts();
      return accounts.includes(newAccount) ? newAccount : accounts[0];
    }
    case EthereumWalletType.readOnly: {
      const keychain = await keychainManager.importKeychain({
        type: KeychainType.ReadOnlyKeychain,
        address: secret as Address,
      });
      const address = (await keychain.getAccounts())[0];
      return address;
    }
    default:
      throw new Error('Wallet type not recognized.');
  }
};

export const addNewAccount = async (
  siblingAddress: Address,
): Promise<Address> => {
  const keychain = await keychainManager.getKeychain(siblingAddress);
  const newAccount = await keychainManager.addNewAccount(keychain);
  return newAccount;
};

export const removeAccount = async (address: Address): Promise<void> => {
  return keychainManager.removeAccount(address);
};

export const getWallets = async () => {
  return keychainManager.getWallets();
};

export const getAccounts = async (): Promise<Address[]> => {
  return keychainManager.getAccounts();
};

export const exportKeychain = async (
  address: Address,
  password: string,
): Promise<string> => {
  return keychainManager.exportKeychain(address, password);
};

export const exportAccount = async (
  address: Address,
  password: string,
): Promise<string> => {
  return keychainManager.exportAccount(address, password);
};

const EIP_7702_TX_TYPE = 4;

export const sendTransaction = async (
  txPayload: TransactionRequest,
  provider: Provider,
): Promise<TransactionResponse> => {
  if (typeof txPayload.from === 'undefined') {
    throw new Error('Missing from address');
  }

  const signer = await keychainManager.getSigner(txPayload.from as Address);
  const wallet = signer.connect(provider);

  // TEMP: txv4 (EIP-7702) bypass - ethers rejects authorizationList and parseTransaction for type 4.
  // Use viem sign + send, build response manually. Remove when ethers→viem migration PR lands.
  if (Number(txPayload.type) === EIP_7702_TX_TYPE) {
    const signedTx = await signer.signTransaction(txPayload);
    const client = getViemClient({ chainId: txPayload.chainId });
    const hash = await client.sendRawTransaction({
      serializedTransaction: signedTx as `0x${string}`,
    });
    const response: TransactionResponse = {
      hash,
      from: txPayload.from as string,
      to: txPayload.to as string,
      nonce: txPayload.nonce !== undefined ? Number(txPayload.nonce) : 0,
      gasLimit: BigNumber.from(txPayload.gasLimit ?? 0),
      gasPrice: txPayload.gasPrice
        ? BigNumber.from(txPayload.gasPrice)
        : undefined,
      maxFeePerGas: txPayload.maxFeePerGas
        ? BigNumber.from(txPayload.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: txPayload.maxPriorityFeePerGas
        ? BigNumber.from(txPayload.maxPriorityFeePerGas)
        : undefined,
      data: (txPayload.data?.toString() ?? '0x') as string,
      value: BigNumber.from(txPayload.value ?? 0),
      chainId: txPayload.chainId ?? 1,
      confirmations: 0,
      wait: async () => {
        /* eslint-disable no-await-in-loop -- intentional poll for receipt */
        for (let i = 0; i < 120; i++) {
          const receipt = await provider.getTransactionReceipt(hash);
          if (receipt) return receipt;
          await new Promise<void>((r) => {
            setTimeout(r, 1000);
          });
        }
        /* eslint-enable no-await-in-loop */
        throw new Error('Transaction receipt not found');
      },
    };
    return normalizeTransactionResponsePayload(response);
  }

  let response = await wallet.sendTransaction(txPayload);
  response = normalizeTransactionResponsePayload(response);
  return response;
};

export const executeRap = async ({
  rapActionParameters,
  type,
  provider,
}: {
  rapActionParameters: RapSwapActionParameters<'swap' | 'crosschainSwap'>;
  type: RapTypes;
  provider: Provider;
}): Promise<{
  nonce: number | undefined;
  errorMessage?: string | null;
  hash?: string | null;
}> => {
  const from = (rapActionParameters.address ||
    rapActionParameters.quote?.from) as Address;
  if (typeof from === 'undefined') {
    throw new Error('Missing from address');
  }

  // Get wallet info to determine if atomic execution is allowed
  const walletInfo = await keychainManager.getWallet(from);
  const isHardwareWallet =
    walletInfo?.type === KeychainType.HardwareWalletKeychain;

  const atomicSwapsEnabled = getAtomicSwapsEnabled();
  const delegationEnabled = getDelegationEnabled();

  // Determine if atomic execution (delegation-based) should be used.
  // Both feature flags must be enabled - delegation and atomic swaps are
  // gated together to ensure the full flow is feature-flagged.
  const canUseAtomic =
    atomicSwapsEnabled &&
    delegationEnabled &&
    (type === 'swap' || type === 'crosschainSwap') &&
    !isHardwareWallet;

  logger.debug('[Delegation] executeRap called', {
    rapType: type,
    from,
    chainId: rapActionParameters.chainId,
    isHardwareWallet,
    atomicSwapsEnabled,
    delegationEnabled,
    canUseAtomic,
  });

  const signer = await keychainManager.getSigner(from);
  const wallet = signer.connect(provider);

  // Pass atomic flag to walletExecuteRap - it will handle feature flag checks
  return walletExecuteRap(wallet, type, {
    ...rapActionParameters,
    atomic: canUseAtomic,
  });
};

export const signMessage = async ({
  address,
  message,
}: SignMessageArguments): Promise<Hex> => {
  const signer = await keychainManager.getSigner(address);
  const messageContent = getMessageContent(message);
  return (await signer.signMessage(messageContent)) as Hex;
};

export const getWallet = async (address: Address) => {
  return keychainManager.getWallet(address);
};

export const getPath = async (address: Address) => {
  return keychainManager.getPath(address);
};

export const addAccountAtIndex = async (
  siblingAddress: Address,
  index: number,
  address: Address,
) => {
  const keychain = await keychainManager.getKeychain(siblingAddress);
  const newAccount = await keychainManager.addAccountAtIndex(
    keychain,
    index,
    address,
  );
  return newAccount;
};

/**
 * Guard function to check if typed data is v1 format
 * v1 format is an array of TypedDataV1Field objects: [{ name, type, value }, ...]
 * It lacks domain/types/primaryType fields that v3/v4 have
 */
const isTypedDataV1 = (
  data: unknown,
): data is Array<{ name: string; type: string; value: unknown }> => {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (field) =>
        typeof field === 'object' &&
        field !== null &&
        'name' in field &&
        'type' in field &&
        'value' in field &&
        typeof field.name === 'string' &&
        typeof field.type === 'string',
    )
  );
};

/**
 * Guard function to check if typed data is v3/v4 format
 * v3/v4 format has domain, types, and primaryType fields
 */
const isTypedDataV3V4 = (
  data: unknown,
): data is {
  domain: unknown;
  types: unknown;
  primaryType: unknown;
  message?: unknown;
  value?: unknown;
} => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    ('domain' in data || 'types' in data || 'primaryType' in data)
  );
};

/**
 * Normalizes typed data by converting 'value' field to 'message' if needed
 * Some dapps use 'value' instead of 'message' for the data payload
 */
const normalizeTypedDataMessage = <
  T extends { message?: unknown; value?: unknown },
>(
  data: T,
): T & { message: Record<string, unknown> } => {
  // Convert value to message if message is missing
  const normalizedData =
    data.message === undefined && data.value !== undefined
      ? { ...data, message: data.value }
      : data;

  // Ensure message exists as an object to prevent sanitizeTypedData from crashing
  // sanitizeTypedData does Object.keys(data.message) which will throw if message is null/undefined
  const message =
    normalizedData.message === undefined || normalizedData.message === null
      ? {}
      : (normalizedData.message as Record<string, unknown>);

  return { ...normalizedData, message };
};

type ValidatedTypedData = {
  domain: Record<string, unknown>;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message?: unknown;
  value?: unknown;
};

/**
 * Validates that typed data has all required fields for viem
 * Returns the validated data or throws an error
 */
const validateTypedDataFields = (data: {
  domain?: unknown;
  types?: unknown;
  primaryType?: unknown;
  message?: unknown;
  value?: unknown;
}): ValidatedTypedData => {
  // Check if fields exist and are not empty
  // sanitizeTypedData returns {} for missing fields, so we need to check for empty objects
  const hasValidDomain =
    data.domain &&
    typeof data.domain === 'object' &&
    Object.keys(data.domain as Record<string, unknown>).length > 0;
  const hasValidTypes =
    data.types &&
    typeof data.types === 'object' &&
    Object.keys(data.types as Record<string, unknown>).length > 0;
  const hasValidPrimaryType =
    data.primaryType &&
    typeof data.primaryType === 'string' &&
    data.primaryType.length > 0;

  if (!hasValidDomain || !hasValidTypes || !hasValidPrimaryType) {
    throw new Error(
      'Invalid typed data: missing domain, types, or primaryType',
    );
  }
  return {
    domain: data.domain as Record<string, unknown>,
    types: data.types as Record<string, Array<{ name: string; type: string }>>,
    primaryType: data.primaryType as string,
    message: data.message,
    value: data.value,
  };
};

/**
 * Signs typed data using the appropriate method based on version
 * - v1: Uses @metamask/eth-sig-util (legacy array format)
 * - v3/v4: Uses viem's signTypedData (EIP-712 format)
 */
export const signTypedData = async ({
  address,
  message,
}: SignTypedDataArguments): Promise<Hex> => {
  const signer = (await keychainManager.getSigner(address)) as Wallet;

  if (!isTypedDataMessage(message)) {
    throw new Error('Invalid message type: expected typed data message');
  }

  const typedData = message.data;

  // Handle v1 format (legacy array format)
  if (isTypedDataV1(typedData)) {
    const pkeyBuffer = Buffer.from(
      addHexPrefix(signer.privateKey).substring(2),
      'hex',
    );
    return signTypedDataSigUtil({
      data: typedData,
      privateKey: pkeyBuffer,
      version: SignTypedDataVersion.V1,
    }) as Hex;
  }

  // Handle v3/v4 format (EIP-712)
  if (!isTypedDataV3V4(typedData)) {
    throw new Error(
      'Invalid typed data format: must be v1 array format or v3/v4 EIP-712 format',
    );
  }

  // Normalize and sanitize the data
  const normalizedData = normalizeTypedDataMessage(typedData);
  const sanitizedData = sanitizeTypedData(normalizedData);

  // Validate required fields
  const validatedData = validateTypedDataFields(sanitizedData);

  // Extract message (viem uses 'message', but we support 'value' as fallback)
  const messageData = validatedData.message || validatedData.value || {};

  return await viemSignTypedData({
    domain: validatedData.domain as never,
    types: validatedData.types as never,
    primaryType: validatedData.primaryType,
    message: messageData as never,
    privateKey: addHexPrefix(signer.privateKey) as Hex,
  } as Parameters<typeof viemSignTypedData>[0]);
};
