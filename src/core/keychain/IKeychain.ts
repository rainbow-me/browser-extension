import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { Address, Hex } from 'viem';

export type PrivateKey = Hex;

export type TWallet = Omit<Wallet, 'address' | 'privateKey'> & {
  address: Address;
  privateKey: PrivateKey;
};

export interface IKeychain {
  type: string;
  serialize(): Promise<unknown>;
  deserialize(options: unknown): Promise<void>;
  addNewAccount(): Promise<Array<Wallet>>;
  addAccountAtIndex(index: number, address: Address): Promise<Address>;
  getAccounts(): Promise<Array<Address>>;
  getSigner(address: Address): Signer;
  exportAccount(address: Address): Promise<PrivateKey>;
  exportKeychain(address: Address): Promise<string>;
  removeAccount(address: Address): Promise<void>;
}
