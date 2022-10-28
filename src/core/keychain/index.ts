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

export const createWallet = async (): Promise<Address> => {
  const keychain = await keychainManager.addNewKeychain();
  const address = (await keychain.getAccounts())[0];
  return address;
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
        mnemonic: secret,
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

export const deleteWallet = async (address: Address): Promise<void> => {
  return keychainManager.removeAccount(address);
};

export const getAccounts = async (): Promise<Address[]> => {
  return keychainManager.getAccounts();
};

export const getSigner = async (address: Address): Promise<Signer> => {
  return keychainManager.getSigner(address);
};

export const exportKeychain = async (address: Address): Promise<string> => {
  return keychainManager.exportKeychain(address);
};

export const exportAccount = async (address: Address): Promise<string> => {
  return keychainManager.exportAccount(address);
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
