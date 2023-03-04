import { Signer, Wallet } from 'ethers';
import { Mnemonic } from 'ethers/lib/utils';
import { Address } from 'wagmi';

export type PrivateKey = string;

export interface IKeychain {
  type: string;
  serialize(): Promise<unknown>;
  deserialize(options: unknown): Promise<void>;
  addNewAccount(): Promise<Array<Wallet>>;
  addAccountAtIndex(index: number, address: Address): Promise<Address>;
  getAccounts(): Promise<Array<Address>>;
  getSigner(address: Address): Signer;
  exportAccount(address: Address): Promise<PrivateKey>;
  exportKeychain(address: Address): Promise<Mnemonic['phrase']>;
  removeAccount(address: Address): Promise<void>;
}
