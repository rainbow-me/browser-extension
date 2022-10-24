/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer, Wallet } from 'ethers';
import { Mnemonic } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedKeypairKeychain {
  type: string;
  privateKey: PrivateKey;
}

export class KeyPairKeychain implements IKeychain {
  type: string;
  #wallets: Wallet[] | Signer[];

  constructor(options: SerializedKeypairKeychain) {
    this.type = 'KeyPairKeychain';
    this.#wallets = [];
    this.deserialize(options);
  }

  #getWalletForAddress(): Wallet {
    return this.#wallets[0] as Wallet;
  }

  getSigner(address: Address): Signer {
    const wallet = this.#getWalletForAddress();
    return wallet;
  }

  async serialize(): Promise<SerializedKeypairKeychain> {
    return {
      privateKey: (this.#wallets[0] as Wallet).privateKey as PrivateKey,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedKeypairKeychain) {
    this.#wallets = [new Wallet(opts.privateKey)];
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = this.#wallets.map(
      (wallet) => (wallet as Wallet).address as Address,
    );
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = this.#getWalletForAddress();
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<Mnemonic['phrase']> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    this.#wallets = [];
  }
}
