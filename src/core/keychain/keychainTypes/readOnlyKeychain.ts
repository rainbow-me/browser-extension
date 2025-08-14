/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { Address, isAddress } from 'viem';

import { KeychainType } from '~/core/types/keychainTypes';
import { RainbowError, logger } from '~/logger';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedReadOnlyKeychain {
  type: KeychainType.ReadOnlyKeychain;
  address: Address;
}
export class ReadOnlyKeychain implements IKeychain {
  type: KeychainType.ReadOnlyKeychain = KeychainType.ReadOnlyKeychain;
  address?: Address;

  init(options: SerializedReadOnlyKeychain) {
    this.deserialize(options);
  }

  _getWalletForAddress(): Wallet {
    return { address: this.address as Address } as Wallet;
  }

  getSigner(address: Address): Signer {
    throw new Error('Method not implemented.');
  }

  addAccountAtIndex(index: number, address: Address): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  async serialize(): Promise<SerializedReadOnlyKeychain> {
    return {
      address: this.address as Address,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedReadOnlyKeychain) {
    if (!isAddress(opts.address)) {
      const error = new RainbowError('Invalid address');
      logger.error(error, { address: opts.address });
      throw error;
    }
    this.address = opts.address;
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = (this.address as Address)
      ? [this.address as Address]
      : [];
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    throw new Error('Method not implemented.');
  }

  async exportKeychain(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    this.address = undefined;
  }
}
