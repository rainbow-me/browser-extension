import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedHardwareWalletKeychain {
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

export class HardwareWalletKeychain implements IKeychain {
  type: string;
  vendor?: string;

  constructor() {
    this.type = KeychainType.HardwareWalletKeychain;
    this.vendor = undefined;

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
        privates.get(this).wallets.push(wallet);
        return wallet;
      },
    });
  }

  init(options: SerializedHardwareWalletKeychain) {
    return this.deserialize(options);
  }

  async addAccountAtIndex(index: number, address: Address): Promise<Address> {
    const wallet = {
      address,
      index,
    };
    privates.get(this).wallets.push(wallet);
    return Promise.resolve(address);
  }

  addNewAccount(): Promise<Wallet[]> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSigner(address: Address): Signer {
    throw new Error('Method not implemented.');
  }

  getPath(address: Address): string {
    const wallet = privates
      .get(this)
      .wallets.find((wallet: Wallet) => (wallet as Wallet).address === address);
    return `${privates.get(this).hdPath}/${wallet.index}`;
  }

  async serialize(): Promise<SerializedHardwareWalletKeychain> {
    return {
      deviceId: privates.get(this).deviceId,
      accountsEnabled: privates.get(this).accountsEnabled,
      hdPath: privates.get(this).hdPath,
      type: this.type,
      accountsDeleted: privates.get(this).accountsDeleted,
      wallets: privates.get(this).wallets,
      vendor: this.vendor,
    };
  }

  async deserialize(opts: SerializedHardwareWalletKeychain) {
    if (opts?.hdPath) privates.get(this).hdPath = opts.hdPath;
    if (opts?.deviceId) privates.get(this).deviceId = opts.deviceId;
    if (opts?.wallets) privates.get(this).wallets = opts.wallets;
    if (opts?.vendor) this.vendor = opts.vendor;
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
