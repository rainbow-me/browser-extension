import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
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
/* eslint-enable boundaries/element-types */

import { walletExecuteRap } from '../raps/execute';
import { RapSwapActionParameters, RapTypes } from '../raps/references';
import { KeychainType } from '../types/keychainTypes';
import { EthereumWalletType } from '../types/walletTypes';
import {
  EthereumWalletSeed,
  identifyWalletType,
  normalizeTransactionResponsePayload,
  sanitizeTypedData,
} from '../utils/ethereum';
import { addHexPrefix } from '../utils/hex';

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

      await keychainManager.importKeychain(opts);
      // returning the derived address instead of the first from the keychain,
      // because this pk could have been elevated to hd while importing
      return newAccount;
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

export const sendTransaction = async (
  txPayload: TransactionRequest,
  provider: Provider,
): Promise<TransactionResponse> => {
  if (typeof txPayload.from === 'undefined') {
    throw new Error('Missing from address');
  }

  const signer = await keychainManager.getSigner(txPayload.from as Address);
  const wallet = signer.connect(provider);
  let response = await wallet.sendTransaction(txPayload);
  response = normalizeTransactionResponsePayload(response);
  return response;
};

export const executeRap = async ({
  rapActionParameters,
  type,
  provider,
}: {
  rapActionParameters: RapSwapActionParameters<
    'swap' | 'crosschainSwap' | 'claimBridge'
  >;
  type: RapTypes;
  provider: Provider;
}): Promise<{ nonce: number | undefined }> => {
  const from = (rapActionParameters.address ||
    rapActionParameters.quote?.from) as Address;
  if (typeof from === 'undefined') {
    throw new Error('Missing from address');
  }
  const signer = await keychainManager.getSigner(from);
  const wallet = signer.connect(provider);
  return walletExecuteRap(wallet, type, rapActionParameters);
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

export const signTypedData = async ({
  address,
  message,
}: SignTypedDataArguments): Promise<Hex> => {
  const signer = (await keychainManager.getSigner(address)) as Wallet;

  if (!isTypedDataMessage(message)) {
    throw new Error('Invalid message type: expected typed data message');
  }

  const typedData = message.data;

  // Check if this is v1 (legacy format without domain/types/primaryType)
  // Note: v1 is very rare and the type system expects v3/v4 format
  // v1 format is an array, not the object format we use for v3/v4
  const isV1 =
    typeof typedData === 'object' &&
    typedData !== null &&
    !(
      'types' in typedData ||
      'primaryType' in typedData ||
      'domain' in typedData
    );

  if (isV1) {
    // For v1, fall back to @metamask/eth-sig-util
    // This is legacy format and should be rare
    // v1 format is an array format, which @metamask/eth-sig-util expects
    const pkeyBuffer = Buffer.from(
      addHexPrefix(signer.privateKey).substring(2),
      'hex',
    );
    // Type assertion needed because v1 format is incompatible with our TypedDataDefinition type
    // The library expects an array format for v1, which we've verified via the isV1 guard
    return signTypedDataSigUtil({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: typedData as any,
      privateKey: pkeyBuffer,
      version: SignTypedDataVersion.V1,
    }) as `0x${string}`;
  }

  // For v3/v4, use viem's signTypedData which properly handles EIP-712
  const sanitizedData = sanitizeTypedData(typedData);

  // Ensure we have the required fields for viem
  if (
    !sanitizedData.domain ||
    !sanitizedData.types ||
    !sanitizedData.primaryType
  ) {
    throw new Error(
      'Invalid typed data: missing domain, types, or primaryType',
    );
  }

  // viem uses 'message' instead of 'value' for the data payload
  const messageData = sanitizedData.message || sanitizedData.value || {};

  // After sanitization and validation checks, we know the structure is correct
  // The sanitizedData has the required fields, so we can safely pass them to viem
  // Type assertion needed because viem's TypedDataDefinition has very strict types
  // but sanitizedData is structurally compatible after validation
  return await viemSignTypedData({
    domain: sanitizedData.domain as never,
    types: sanitizedData.types as never,
    primaryType: sanitizedData.primaryType,
    message: messageData as never,
    privateKey: addHexPrefix(signer.privateKey) as Hex,
  } as Parameters<typeof viemSignTypedData>[0]);
};
