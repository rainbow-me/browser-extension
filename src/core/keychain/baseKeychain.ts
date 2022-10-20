/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bytes, BytesLike, Signer, Transaction, Wallet } from 'ethers';
import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer';

import { TransactionRequest } from '@ethersproject/abstract-provider';

import { Address } from 'wagmi';
import { SigningKey } from 'ethers/lib/utils';

export type PrivateKey = BytesLike | ExternallyOwnedAccount | SigningKey;

export class BaseKeychain {
  type = 'BaseKeychain';
  _wallets: Wallet[] | Signer[];

  constructor() {
    this._wallets = [];
  }

  serialize(): Promise<unknown> {
    return Promise.resolve();
  }

  deserialize(options: unknown) {
    return Promise.resolve();
  }

  addAccountAtIndex(_index: number): Promise<Array<Wallet>> {
    return Promise.resolve([]);
  }

  getAccounts(): Promise<Array<Address>> {
    return Promise.resolve([]);
  }

  signTransaction(
    address: Address,
    transaction: TransactionRequest,
  ): Promise<Transaction['hash']> {
    return Promise.resolve('');
  }

  signMessage(address: Address, data: Bytes | string): Promise<string> {
    return Promise.resolve('');
  }

  exportAccount(address: Address): Promise<PrivateKey> {
    return Promise.resolve('');
  }

  rremoveAccount(address: Address): Promise<void> {
    return Promise.resolve();
  }
}
