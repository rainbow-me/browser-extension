/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer, Wallet } from 'ethers';
import { Mnemonic } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedKeypairKeychain {
  type: string;
  privateKey: PrivateKey;
}

export class KeyPairKeychain implements IKeychain {
  type: string;
  _wallets: Wallet[] | Signer[];

  constructor() {
    this.type = KeychainType.KeyPairKeychain;
    this._wallets = [];
  }

  init(options: SerializedKeypairKeychain) {
    this.deserialize(options);
  }

  _getWalletForAddress(): Wallet {
    return this._wallets[0] as Wallet;
  }

  getSigner(address: Address): Signer {
    const wallet = this._getWalletForAddress();
    return wallet;
  }

  async serialize(): Promise<SerializedKeypairKeychain> {
    return {
      privateKey: (this._wallets[0] as Wallet).privateKey as PrivateKey,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedKeypairKeychain) {
    this._wallets = [new Wallet(opts.privateKey)];
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = this._wallets.map(
      (wallet) => (wallet as Wallet).address as Address,
    );
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = this._getWalletForAddress();
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<Mnemonic['phrase']> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    this._wallets = [];
  }
}
