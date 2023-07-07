import { Signer } from '@ethersproject/abstract-signer';
import { HDNode } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey } from '../IKeychain';
import { autoDiscoverAccounts } from '../utils';

export interface SerializedHdKeychain {
  mnemonic: string;
  hdPath?: string;
  accountsEnabled?: number;
  type: string;
  imported?: boolean;
  autodiscover?: boolean;
  accountsDeleted?: Array<number>;
}

const privates = new WeakMap();

export class HdKeychain implements IKeychain {
  type: string;
  imported: boolean;

  constructor() {
    this.type = KeychainType.HdKeychain;
    this.imported = false;

    privates.set(this, {
      wallets: [],
      mnemonic: null,
      accountsEnabled: 1,
      accountsDeleted: [],
      hdPath: "m/44'/60'/0'/0",
      getWalletForAddress: (address: Address): Wallet => {
        return privates
          .get(this)
          .wallets.find(
            (wallet: Wallet) =>
              (wallet as Wallet).address.toLowerCase() ===
              address.toLowerCase(),
          ) as Wallet;
      },
      deriveWallet: (index: number): HDNode => {
        const hdNode = HDNode.fromMnemonic(
          privates.get(this).mnemonic as string,
        );
        const derivedWallet = hdNode.derivePath(
          `${privates.get(this).hdPath}/${index}`,
        );
        return derivedWallet;
      },

      addAccount: (index: number): Wallet => {
        const derivedWallet = privates.get(this).deriveWallet(index);
        const wallet = new Wallet(derivedWallet.privateKey);
        privates.get(this).wallets.push(wallet);
        return wallet;
      },
    });
  }

  init(options: SerializedHdKeychain) {
    return this.deserialize(options);
  }

  getSigner(address: Address): Signer {
    const wallet = privates.get(this).getWalletForAddress(address);
    return wallet;
  }

  async serialize(): Promise<SerializedHdKeychain> {
    return {
      imported: this.imported,
      mnemonic: privates.get(this).mnemonic as string,
      accountsEnabled: privates.get(this).accountsEnabled,
      hdPath: privates.get(this).hdPath,
      type: this.type,
      accountsDeleted: privates.get(this).accountsDeleted,
    };
  }

  async deserialize(opts?: SerializedHdKeychain) {
    if (!opts) return;

    if (opts.hdPath) privates.get(this).hdPath = opts.hdPath;
    if (opts.imported) this.imported = opts.imported;
    if (opts.accountsEnabled)
      privates.get(this).accountsEnabled = opts.accountsEnabled;
    if (opts.accountsDeleted?.length)
      privates.get(this).accountsDeleted = opts.accountsDeleted;

    privates.get(this).mnemonic =
      opts.mnemonic || Wallet.createRandom().mnemonic.phrase;

    // If we didn't explicit add a new account, we need attempt to autodiscover the rest
    if (opts.autodiscover) {
      const { accountsEnabled } = await autoDiscoverAccounts({
        deriveWallet: privates.get(this).deriveWallet,
      });
      privates.get(this).accountsEnabled = accountsEnabled;
    }

    for (let i = 0; i < privates.get(this).accountsEnabled; i++) {
      // Do not re-add deleted accounts
      if (!opts.accountsDeleted?.includes(i)) {
        privates.get(this).addAccount(i);
      }
    }
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    privates.get(this).addAccount(privates.get(this).accountsEnabled);
    privates.get(this).accountsEnabled += 1;
    return privates.get(this).wallets as Wallet[];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addAccountAtIndex(index: number, address: Address): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = privates
      .get(this)
      .wallets.map((wallet: Wallet) => (wallet as Wallet).address as Address);
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = privates.get(this).getWalletForAddress(address);
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<string> {
    return privates.get(this).mnemonic as string;
  }

  async removeAccount(address: Address): Promise<void> {
    const accounts = await this.getAccounts();
    console.log('accounts', accounts);
    const accountToDeleteIndex = accounts.indexOf(address);
    console.log('i', accountToDeleteIndex);
    if (accountToDeleteIndex === -1) {
      throw new Error('Account not found');
    }

    const filteredList = privates
      .get(this)
      .wallets.filter(
        (wallet: Wallet) => (wallet as Wallet).address !== address,
      );

    console.log('filtered', filteredList);

    privates.get(this).wallets = filteredList;
    privates.get(this).accountsDeleted.push(accountToDeleteIndex);
  }
}
