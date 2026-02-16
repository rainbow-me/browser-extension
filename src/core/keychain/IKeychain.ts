import { Address, Hex } from 'viem';

export type PrivateKey = Hex;

export type TWallet = {
  address: Address;
  privateKey: PrivateKey;
};

export interface IKeychain {
  type: string;
  serialize(): Promise<unknown>;
  deserialize(options: unknown): Promise<void>;
  addNewAccount(): Promise<Array<TWallet>>;
  addAccountAtIndex(index: number, address: Address): Promise<Address>;
  getAccounts(): Promise<Array<Address>>;
  exportAccount(address: Address): Promise<PrivateKey>;
  exportKeychain(address: Address): Promise<string>;
  removeAccount(address: Address): Promise<void>;
}
