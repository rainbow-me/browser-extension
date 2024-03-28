/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from '@ethersproject/abstract-signer';
import { Mnemonic } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import { getProvider } from '@wagmi/core';
import { type Address } from 'viem';
import { mainnet } from 'viem/chains';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey, TWallet } from '../IKeychain';
import { RainbowSigner } from '../RainbowSigner';

export interface SerializedKeypairKeychain {
  type: string;
  privateKey: PrivateKey;
}

const privates = new WeakMap();

export class KeyPairKeychain implements IKeychain {
  type: string;

  constructor() {
    this.type = KeychainType.KeyPairKeychain;
    privates.set(this, {
      wallets: [],
    });
  }

  init(options: SerializedKeypairKeychain) {
    this.deserialize(options);
  }

  getSigner(address: Address): Signer {
    const provider = getProvider({ chainId: mainnet.id });
    const wallet = privates.get(this).wallets[0] as TWallet;
    if (!wallet) throw new Error('Account not found');
    return new RainbowSigner(provider, wallet.privateKey, wallet.address);
  }

  async serialize(): Promise<SerializedKeypairKeychain> {
    return {
      privateKey: (privates.get(this).wallets[0] as Wallet)
        .privateKey as PrivateKey,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedKeypairKeychain) {
    privates.get(this).wallets = [new Wallet(opts.privateKey)];
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    throw new Error('Method not implemented.');
  }

  addAccountAtIndex(index: number, address: Address): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = privates
      .get(this)
      .wallets.map((wallet: Wallet) => (wallet as Wallet).address as Address);
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = privates.get(this).wallets[0];
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<Mnemonic['phrase']> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    privates.get(this).wallets = [];
  }
}
