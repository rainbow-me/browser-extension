import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';

import { KeychainType } from '~/core/types/keychainTypes';
import { getProvider } from '~/core/wagmi/clientToProvider';

import { HWSigner } from '../HWSigner';
import { IKeychain, PrivateKey } from '../IKeychain';
import { getHDPathForVendorAndType } from '../hdPath';

export interface SerializedHardwareWalletKeychain {
  vendor?: string;
  hdPath?: string;
  deviceId?: string;
  accountsEnabled?: number;
  type: KeychainType.HardwareWalletKeychain;
  autodiscover?: boolean;
  wallets?: Array<{ address: Address; index: number; hdPath?: string }>;
  accountsDeleted?: Array<number>;
}

const privates = new WeakMap();

export class HardwareWalletKeychain implements IKeychain {
  type: KeychainType.HardwareWalletKeychain =
    KeychainType.HardwareWalletKeychain;
  vendor?: string;

  constructor() {
    this.vendor = undefined;

    privates.set(this, {
      wallets: [],
      deviceId: '',
      accountsEnabled: 1,
      accountsDeleted: [],
      hdPath: '', // No longer used but kept for backwards compatibility
      addAccount: (
        index: number,
        address: Address,
        hdPath: string,
      ): { address: Address; index: number; hdPath?: string } => {
        const wallet = {
          address,
          index,
          hdPath,
        };
        privates.get(this).wallets.push(wallet);
        return wallet;
      },
    });
  }

  init(options: SerializedHardwareWalletKeychain) {
    return this.deserialize(options);
  }

  async addAccountAtIndex(
    index: number,
    address: Address,
    hdPath?: string,
  ): Promise<Address> {
    const wallet = {
      address,
      index,
      hdPath,
    };
    privates.get(this).wallets.push(wallet);
    return Promise.resolve(address);
  }

  addNewAccount(): Promise<Wallet[]> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSigner(address: Address): Signer {
    const provider = getProvider({
      chainId: mainnet.id,
    });
    return new HWSigner(
      provider,
      this.getPath(address),
      privates.get(this).deviceId,
      address,
      this.vendor as string,
    );
  }

  getPath(address: Address): string {
    const wallet = privates
      .get(this)
      .wallets.find((wallet: Wallet) => (wallet as Wallet).address === address);
    return (
      wallet.hdPath ??
      // Backwards compatibility
      getHDPathForVendorAndType(
        wallet.index,
        this.vendor as 'Ledger' | 'Trezor',
      )
    );
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

  async deserialize(opts?: SerializedHardwareWalletKeychain) {
    if (!opts) return;
    if (opts.hdPath) privates.get(this).hdPath = opts.hdPath;
    if (opts.deviceId) privates.get(this).deviceId = opts.deviceId;
    if (opts.wallets) privates.get(this).wallets = opts.wallets;
    if (opts.vendor) this.vendor = opts.vendor;
    if (opts.accountsEnabled)
      privates.get(this).accountsEnabled = opts.accountsEnabled;
    if (opts.accountsDeleted?.length)
      privates.get(this).accountsDeleted = opts.accountsDeleted;
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
