import { Signer } from '@ethersproject/abstract-signer';
import { Mnemonic } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import { Address } from 'wagmi';

export type PrivateKey = string;

export interface IKeychain {
  type: string;
  serialize(): Promise<unknown>;
  deserialize(options: unknown): Promise<void>;
  addNewAccount(): Promise<Array<Wallet>>;
  getAccounts(): Promise<Array<Address>>;
  getSigner(address: Address): Signer;
  exportAccount(address: Address): Promise<PrivateKey>;
  exportKeychain(address: Address): Promise<Mnemonic['phrase']>;
  removeAccount(address: Address): Promise<void>;
}
