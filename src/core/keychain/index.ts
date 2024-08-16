import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import {
  MessageTypeProperty,
  SignTypedDataVersion,
  TypedMessage,
  signTypedData as signTypedDataSigUtil,
} from '@metamask/eth-sig-util';
import { Address } from 'viem';

import {
  SignMessageArguments,
  SignTypedDataArguments,
} from '~/entries/background/handlers/handleWallets';

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

import { keychainManager } from './KeychainManager';
import { SerializedKeypairKeychain } from './keychainTypes/keyPairKeychain';

interface TypedDataTypes {
  EIP712Domain: MessageTypeProperty[];
  [additionalProperties: string]: MessageTypeProperty[];
}

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
        privateKey: secret,
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
  vendor: string;
  deviceId: string;
  wallets: Array<{ address: Address; index: number; hdPath: string }>;
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
        privateKey: secret,
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

export const getSigner = async (address: Address): Promise<Signer> => {
  return keychainManager.getSigner(address);
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
  msgData,
}: SignMessageArguments): Promise<string> => {
  const signer = await keychainManager.getSigner(address);
  return signer.signMessage(msgData);
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
  msgData,
}: SignTypedDataArguments): Promise<string> => {
  const signer = (await keychainManager.getSigner(address)) as Wallet;

  const pkeyBuffer = Buffer.from(
    addHexPrefix(signer.privateKey).substring(2),
    'hex',
  );
  const parsedData = msgData;

  // There are 3 types of messages
  // v1 => basic data types
  // v3 =>  has type / domain / primaryType
  // v4 => same as v3 but also supports which supports arrays and recursive structs.
  // Because v4 is backwards compatible with v3, we're supporting only v4

  let sanitizedData = parsedData;

  let version = 'v1';
  if (
    typeof parsedData === 'object' &&
    (parsedData.types || parsedData.primaryType || parsedData.domain)
  ) {
    version = 'v4';
    sanitizedData = sanitizeTypedData(parsedData);
  }
  return signTypedDataSigUtil({
    data: sanitizedData as unknown as TypedMessage<TypedDataTypes>,
    privateKey: pkeyBuffer,
    version: version.toUpperCase() as SignTypedDataVersion,
  });
};
