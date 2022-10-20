import { Signer, Transaction, Wallet } from 'ethers';
import { Bytes } from 'ethers/lib/utils';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Address } from 'wagmi';
import { IKeychain, PrivateKey } from './baseKeychain';

export class KeyPairKeychain implements IKeychain {
  type: string;
  _wallets: Wallet[] | Signer[];

  constructor(options: PrivateKey) {
    this.type = 'KeyPairKeychain';
    this._wallets = [];
    this.deserialize(options);
  }

  _getWalletForAddress(address: Address): Wallet {
    return this._wallets.find(
      (wallet) =>
        (wallet as Wallet).address.toLowerCase() === address.toLowerCase(),
    ) as Wallet;
  }

  async serialize(): Promise<PrivateKey[]> {
    return this._wallets.map((wallet) => (wallet as Wallet).privateKey);
  }

  async deserialize(privateKey: PrivateKey) {
    this._wallets = [new Wallet(privateKey)];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addAccount(_index: number): Promise<Array<Wallet>> {
    const wallet = Wallet.createRandom();
    return [wallet];
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = this._wallets.map(
      (wallet) => (wallet as Wallet).address as Address,
    );
    return Promise.resolve(addresses);
  }

  async signTransaction(
    address: Address,
    transaction: TransactionRequest,
  ): Promise<Transaction['hash']> {
    const wallet = this._getWalletForAddress(address);
    return wallet.signTransaction(transaction);
  }

  async signMessage(address: Address, data: Bytes | string): Promise<string> {
    const wallet = this._getWalletForAddress(address);
    return wallet.signMessage(data);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = this._getWalletForAddress(address);
    return wallet.privateKey;
  }

  async removeAccount(address: Address): Promise<void> {
    const filteredList = this._wallets.filter(
      (wallet) => (wallet as Wallet).address !== address.toLowerCase(),
    );
    if (filteredList.length !== this._wallets.length) {
      this._wallets = filteredList;
    } else {
      throw new Error('Account not found');
    }
  }
}
