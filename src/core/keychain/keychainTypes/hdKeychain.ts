import { Signer, Wallet } from 'ethers';
import { HDNode } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';
import { hasPreviousTransactions } from '~/core/utils/ethereum';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedHdKeychain {
  mnemonic: string;
  hdPath?: string;
  accountsEnabled?: number;
  type: string;
  imported?: boolean;
  autodiscover?: boolean;
}

export class HdKeychain implements IKeychain {
  type: string;
  imported: boolean;
  _wallets: Wallet[] | Signer[];
  _mnemonic?: string | null;
  _accountsEnabled: number;
  _hdPath: string;

  constructor() {
    this.type = KeychainType.HdKeychain;
    this.imported = false;
    this._wallets = [];
    this._mnemonic = null;
    this._accountsEnabled = 1;
    this._hdPath = `m/44'/60'/0'/0`;
  }

  init(options: SerializedHdKeychain) {
    return this.deserialize(options);
  }

  _getWalletForAddress(address: Address): Wallet {
    return this._wallets.find(
      (wallet) =>
        (wallet as Wallet).address.toLowerCase() === address.toLowerCase(),
    ) as Wallet;
  }

  getSigner(address: Address): Signer {
    const wallet = this._getWalletForAddress(address);
    return wallet;
  }

  async serialize(): Promise<SerializedHdKeychain> {
    return {
      imported: this.imported,
      mnemonic: this._mnemonic as string,
      accountsEnabled: this._accountsEnabled,
      hdPath: this._hdPath,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedHdKeychain) {
    if (opts?.hdPath) this._hdPath = opts.hdPath;
    if (opts?.imported) this.imported = opts.imported;
    if (opts?.accountsEnabled) this._accountsEnabled = opts.accountsEnabled;

    if (opts?.mnemonic) {
      this._mnemonic = opts.mnemonic;
    } else {
      this._mnemonic = Wallet.createRandom().mnemonic.phrase as string;
    }

    // If we didn't explicit add a new account, we need attempt to autodiscover the rest
    if (opts?.autodiscover) {
      // Autodiscover accounts
      let empty = false;
      while (!empty) {
        const { address } = this._deriveWallet(this._accountsEnabled);
        // eslint-disable-next-line no-await-in-loop
        const hasBeenUsed = await hasPreviousTransactions(address as Address);
        if (hasBeenUsed) {
          this._accountsEnabled = this._accountsEnabled + 1;
        } else {
          empty = true;
        }
      }
    }

    for (let i = 0; i < this._accountsEnabled; i++) {
      this._addAccount(i);
    }
  }
  async addNewAccount(): Promise<Array<Wallet>> {
    this._addAccount(this._accountsEnabled);
    this._accountsEnabled += 1;
    return this._wallets as Wallet[];
  }

  _deriveWallet(index: number): HDNode {
    const hdNode = HDNode.fromMnemonic(this._mnemonic as string);
    const derivedWallet = hdNode.derivePath(`${this._hdPath}/${index}`);
    return derivedWallet;
  }

  _addAccount(index: number): Wallet {
    const derivedWallet = this._deriveWallet(index);
    const wallet = new Wallet(derivedWallet.privateKey);
    this._wallets.push(wallet);
    return wallet;
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = this._wallets.map(
      (wallet) => (wallet as Wallet).address as Address,
    );
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = this._getWalletForAddress(address);
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<string> {
    return this._mnemonic as string;
  }

  async removeAccount(address: Address): Promise<void> {
    const filteredList = this._wallets.filter(
      (wallet) => (wallet as Wallet).address !== address,
    );
    if (filteredList.length !== this._wallets.length) {
      this._wallets = filteredList;
    } else {
      throw new Error('Account not found');
    }
  }
}
