import { Signer, Wallet } from 'ethers';
import { HDNode } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';
import { hasPreviousTransactions } from '~/core/utils/ethereum';

import { IKeychain, PrivateKey } from '../IKeychain';

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

  async deserialize(opts: SerializedHdKeychain) {
    if (opts?.hdPath) privates.get(this).hdPath = opts.hdPath;
    if (opts?.imported) this.imported = opts.imported;
    if (opts?.accountsEnabled)
      privates.get(this).accountsEnabled = opts.accountsEnabled;

    if (opts?.mnemonic) {
      privates.get(this).mnemonic = opts.mnemonic;
    } else {
      privates.get(this).mnemonic = Wallet.createRandom().mnemonic
        .phrase as string;
    }

    // If we didn't explicit add a new account, we need attempt to autodiscover the rest
    if (opts?.autodiscover) {
      // Autodiscover accounts
      let empty = false;
      while (!empty) {
        const { address } = privates
          .get(this)
          .deriveWallet(privates.get(this).accountsEnabled);
        // eslint-disable-next-line no-await-in-loop
        const hasBeenUsed = await hasPreviousTransactions(address as Address);
        if (hasBeenUsed) {
          privates.get(this).accountsEnabled =
            privates.get(this).accountsEnabled + 1;
        } else {
          empty = true;
        }
      }
    }

    for (let i = 0; i < privates.get(this).accountsEnabled; i++) {
      // Do not re-add deleted accounts
      if (!opts?.accountsDeleted?.includes(i)) {
        privates.get(this).addAccount(i);
      }
    }
  }
  async addNewAccount(): Promise<Array<Wallet>> {
    privates.get(this).addAccount(privates.get(this).accountsEnabled);
    privates.get(this).accountsEnabled += 1;
    return privates.get(this).wallets as Wallet[];
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
