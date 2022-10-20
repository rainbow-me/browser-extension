/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bytes, BytesLike, Signer, Transaction, Wallet } from 'ethers';
import { ExternallyOwnedAccount } from '@ethersproject/abstract-signer';

import { TransactionRequest } from '@ethersproject/abstract-provider';

import { Address } from 'wagmi';
import { SigningKey } from 'ethers/lib/utils';

export type PrivateKey = BytesLike | ExternallyOwnedAccount | SigningKey;

export interface IKeychain {
  type: string;
  _wallets: Wallet[] | Signer[];

  serialize(): Promise<unknown>;
  deserialize(options: unknown): Promise<void>;
  addAccount(_index: number): Promise<Array<Wallet>>;
  getAccounts(): Promise<Array<Address>>;
  signTransaction(
    address: Address,
    transaction: TransactionRequest,
  ): Promise<Transaction['hash']>;

  signMessage(address: Address, data: Bytes | string): Promise<string>;

  exportAccount(address: Address): Promise<PrivateKey>;

  removeAccount(address: Address): Promise<void>;
}
