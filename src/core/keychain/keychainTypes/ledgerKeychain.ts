import { Signer, Wallet } from 'ethers';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedLedgerKeychain {
  vendor?: string;
  hdPath?: string;
  deviceId?: string;
  accountsEnabled?: number;
  type: string;
  autodiscover?: boolean;
  wallets?: Array<{ address: Address; index: number }>;
  accountsDeleted?: Array<number>;
}

const privates = new WeakMap();

export class LedgerKeychain implements IKeychain {
  type: string;

  constructor() {
    this.type = KeychainType.LedgerKeychain;

    privates.set(this, {
      wallets: [],
      deviceId: '',
      accountsEnabled: 1,
      accountsDeleted: [],
      hdPath: "m/44'/60'/0'/0",
      addAccount: (
        index: number,
        address: Address,
      ): { address: Address; index: number } => {
        const wallet = {
          address,
          index,
        };
        privates.get(this).addresses.push(wallet);
        return wallet;
      },
    });
  }

  init(options: SerializedLedgerKeychain) {
    return this.deserialize(options);
  }

  addNewAccount(): Promise<Wallet[]> {
    throw new Error('Method not implemented.');
  }

  getSigner(address: Address): Signer {
    const wallet = privates.get(this).getWalletForAddress(address);
    return wallet;
  }

  async serialize(): Promise<SerializedLedgerKeychain> {
    return {
      deviceId: privates.get(this).deviceId,
      accountsEnabled: privates.get(this).accountsEnabled,
      hdPath: privates.get(this).hdPath,
      type: this.type,
      accountsDeleted: privates.get(this).accountsDeleted,
      wallets: privates.get(this).wallets,
    };
  }

  async deserialize(opts: SerializedLedgerKeychain) {
    if (opts?.hdPath) privates.get(this).hdPath = opts.hdPath;
    if (opts?.deviceId) privates.get(this).deviceId = opts.deviceId;
    if (opts?.wallets) privates.get(this).wallets = opts.wallets;
    if (opts?.accountsEnabled)
      privates.get(this).accountsEnabled = opts.accountsEnabled;
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = privates
      .get(this)
      .wallets.map((wallet: Wallet) => (wallet as Wallet).address as Address);
    return Promise.resolve(addresses);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async exportAccount(address: Address): Promise<PrivateKey> {
    throw new Error('Method not implemented.');
  }

  async exportKeychain(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async removeAccount(address: Address): Promise<void> {
    const accounts = await this.getAccounts();
    const accountToDeleteIndex = accounts.indexOf(address);
    if (accountToDeleteIndex === -1) {
      throw new Error('Account not found');
    }

    const filteredList = privates
      .get(this)
      .wallets.filter(
        (wallet: Wallet) => (wallet as Wallet).address !== address,
      );

    privates.get(this).wallets = filteredList;
    privates.get(this).accountsDeleted.push(accountToDeleteIndex);
  }
}
