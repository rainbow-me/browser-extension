/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey, TWallet } from '../IKeychain';

export interface SerializedKeypairKeychain {
  type: KeychainType.KeyPairKeychain;
  privateKey: PrivateKey;
}

const privates = new WeakMap();

export class KeyPairKeychain implements IKeychain {
  type: KeychainType.KeyPairKeychain = KeychainType.KeyPairKeychain;

  constructor() {
    privates.set(this, {
      wallets: [],
    });
  }

  init(options: SerializedKeypairKeychain) {
    this.deserialize(options);
  }

  async serialize(): Promise<SerializedKeypairKeychain> {
    const wallet = privates.get(this).wallets[0] as TWallet;
    return {
      privateKey: wallet.privateKey,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedKeypairKeychain) {
    const account = privateKeyToAccount(opts.privateKey);
    const wallet: TWallet = {
      address: account.address,
      privateKey: opts.privateKey,
    };
    privates.get(this).wallets = [wallet];
  }

  async addNewAccount(): Promise<Array<TWallet>> {
    throw new Error('Method not implemented.');
  }

  addAccountAtIndex(index: number, address: Address): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = privates
      .get(this)
      .wallets.map((wallet: TWallet) => wallet.address);
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = privates.get(this).wallets[0] as TWallet;
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    privates.get(this).wallets = [];
  }
}
