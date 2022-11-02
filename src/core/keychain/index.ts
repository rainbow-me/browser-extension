import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from 'ethers';
import { Address } from 'wagmi';

import {
  SendTransactionArguments,
  SignMessageArguments,
  SignTypedDataArguments,
} from '~/entries/background/handlers/handleWallets';

import { KeychainType } from '../types/keychainTypes';
import { EthereumWalletType } from '../types/walletTypes';
import { EthereumWalletSeed, identifyWalletType } from '../utils/ethereum';

import { keychainManager } from './KeychainManager';

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

export const wipeVault = async (password: string) => {
  return keychainManager.wipe(password);
};

export const lockVault = () => {
  return keychainManager.lock();
};
export const hasVault = () => {
  return !!keychainManager.state.vault;
};

export const isVaultUnlocked = (): boolean => {
  return keychainManager.state.isUnlocked;
};

export const createWallet = async (): Promise<Address> => {
  const keychain = await keychainManager.addNewKeychain();
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
      const keychain = await keychainManager.importKeychain({
        type: KeychainType.KeyPairKeychain,
        privateKey: secret,
      });
      const address = (await keychain.getAccounts())[0];
      return address;
    }
    case EthereumWalletType.readOnly:
      throw new Error('Read-only wallets are not supported yet');
      break;
    default:
      throw new Error('Wallet type not recognized.');
  }
};

export const addNewAccount = async (
  silbingAddress: Address,
): Promise<Address> => {
  const keychain = await keychainManager.getKeychain(silbingAddress);
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

export const sendTransaction = async ({
  address,
  txData,
}: SendTransactionArguments): Promise<TransactionResponse> => {
  const signer = await keychainManager.getSigner(address);
  return signer.sendTransaction(txData);
};

export const signMessage = async ({
  address,
  msgData,
}: SignMessageArguments): Promise<string> => {
  const signer = await keychainManager.getSigner(address);
  return signer.signMessage(msgData);
};
export const signTypedData = async ({
  address,
  msgData,
}: SignTypedDataArguments): Promise<string> => {
  const signer = await keychainManager.getSigner(address);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return signer._signTypedData(msgData.domain, msgData.types, msgData.value);
};
