import { Signer, Transaction, Wallet } from 'ethers';
import { Bytes, HDNode } from 'ethers/lib/utils';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Address } from 'wagmi';
import { IKeychain, PrivateKey } from './baseKeychain';

interface HdKeychainOptions {
  mnemonic: string;
  hdPath?: string;
  accountsEnabled: number;
}

export class HdKeychain implements IKeychain {
  type: string;
  _wallets: Wallet[] | Signer[];
  _mnemonic?: string | null;
  _accountsEnabled: number;
  _hdPath: string;
  constructor(options: HdKeychainOptions) {
    this.type = 'HdKeychain';
    this._wallets = [];
    this._mnemonic = null;
    this._accountsEnabled = 0;
    this._hdPath = `m/44'/60'/0'/0`;
    this.deserialize(options);
  }

  _getWalletForAddress(address: Address): Wallet {
    return this._wallets.find(
      (wallet) =>
        (wallet as Wallet).address.toLowerCase() === address.toLowerCase(),
    ) as Wallet;
  }

  async serialize(): Promise<HdKeychainOptions> {
    return {
      mnemonic: this._mnemonic as string,
      accountsEnabled: this._accountsEnabled,
      hdPath: this._hdPath,
    };
  }

  async deserialize(opts: HdKeychainOptions) {
    if (opts.accountsEnabled && !opts.mnemonic) {
      throw new Error(
        'mnemonic is required if accountsEnabled is greater than 0',
      );
    }
    if (opts.hdPath) this._hdPath = opts.hdPath;

    if (opts.mnemonic) {
      this._mnemonic = opts.mnemonic;
    } else {
      this._mnemonic = Wallet.createRandom().mnemonic.phrase as string;
    }
    if (opts.accountsEnabled) {
      const results = [];
      for (let i = 0; i < opts.accountsEnabled; i++) {
        results.push(this.addAccount(i));
      }
      await Promise.all(results);
    }
  }

  async addAccount(_index: number): Promise<Array<Wallet>> {
    const hdNode = HDNode.fromMnemonic(this._mnemonic as string);
    const wallet = hdNode.derivePath(`${this._hdPath}/${_index}`);
    this._wallets.push(new Wallet(wallet.privateKey));
    return this._wallets as Wallet[];
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
