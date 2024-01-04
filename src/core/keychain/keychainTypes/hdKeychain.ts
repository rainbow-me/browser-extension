/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Signer } from '@ethersproject/abstract-signer';
import { BytesLike } from '@ethersproject/bytes';
import { Wallet } from '@ethersproject/wallet';
import * as bip39 from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { getProvider } from '@wagmi/core';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { bytesToHex } from 'ethereum-cryptography/utils';
import { Address, mainnet } from 'wagmi';

import { KeychainType } from '~/core/types/keychainTypes';

import { IKeychain, PrivateKey, TWallet } from '../IKeychain';
import { keychainManager } from '../KeychainManager';
import { RainbowSigner } from '../RainbowSigner';
import { autoDiscoverAccounts } from '../utils';

export interface RainbowHDKey extends HDKey {
  address: Address;
}

type SupportedHDPath = "m/44'/60'/0'/0";

export interface SerializedHdKeychain {
  mnemonic: string;
  hdPath?: SupportedHDPath;
  accountsEnabled?: number;
  type: string;
  imported?: boolean;
  autodiscover?: boolean;
  accountsDeleted?: Array<number>;
}

const privates = new WeakMap<
  IKeychain,
  {
    wallets: Array<{ wallet: TWallet; index: number }>;
    mnemonic: string | null;
    accountsEnabled: number;
    accountsDeleted: number[];
    hdPath: SupportedHDPath;
    getWalletForAddress(address: Address): Wallet | undefined;
    deriveWallet(index: number): RainbowHDKey;
    addAccount(index: number): Wallet;
  }
>();

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
      getWalletForAddress: (address: Address) => {
        return privates
          .get(this)!
          .wallets.find(
            ({ wallet }) =>
              wallet.address.toLowerCase() === address.toLowerCase(),
          )?.wallet;
      },
      deriveWallet: (index: number): RainbowHDKey => {
        const _privates = privates.get(this)!;
        if (!_privates.mnemonic) throw new Error('No mnemonic');

        const seed = bip39.mnemonicToSeedSync(_privates.mnemonic);
        const hdNode = HDKey.fromMasterSeed(seed);
        const root = hdNode.derive(_privates.hdPath);
        const derivedWallet = root.deriveChild(index) as RainbowHDKey;
        const pkeyHex = bytesToHex(derivedWallet.privateKey as Uint8Array);
        const wallet = new Wallet(pkeyHex) as TWallet;
        derivedWallet.address = wallet.address;
        return derivedWallet;
      },

      addAccount: (index: number): Wallet => {
        const _privates = privates.get(this)!;
        const derivedWallet = _privates.deriveWallet(index);

        // if account already exists in a readonly keychain, remove it
        keychainManager
          .isAccountInReadOnlyKeychain(derivedWallet.address)
          ?.removeAccount(derivedWallet.address);

        const wallet = new Wallet(
          derivedWallet.privateKey as BytesLike,
        ) as TWallet;
        _privates.wallets.push({ wallet, index: derivedWallet.index });
        return wallet;
      },
    });
  }

  init(options?: SerializedHdKeychain) {
    return this.deserialize(options);
  }

  getSigner(address: Address): Signer {
    const _privates = privates.get(this)!;
    const provider = getProvider({ chainId: mainnet.id });
    const wallet = _privates!.getWalletForAddress(address) as TWallet;
    if (!wallet) throw new Error('Account not found');
    return new RainbowSigner(provider, wallet.privateKey, wallet.address);
  }

  async serialize(): Promise<SerializedHdKeychain> {
    const _privates = privates.get(this)!;
    if (!_privates.mnemonic) throw new Error('No mnemonic');
    return {
      imported: this.imported,
      mnemonic: _privates.mnemonic,
      accountsEnabled: _privates.accountsEnabled,
      hdPath: _privates.hdPath,
      type: this.type,
      accountsDeleted: _privates.accountsDeleted,
    };
  }

  async deserialize(opts?: SerializedHdKeychain) {
    const _privates = privates.get(this)!;

    if (opts?.hdPath) _privates.hdPath = opts.hdPath;
    this.imported = !!opts?.imported;
    if (opts?.accountsEnabled) _privates.accountsEnabled = opts.accountsEnabled;
    if (opts?.accountsDeleted) _privates.accountsDeleted = opts.accountsDeleted;
    if (opts?.mnemonic) {
      if (!bip39.validateMnemonic(opts.mnemonic, englishWordlist)) {
        throw new Error('Invalid mnemonic');
      }
      _privates.mnemonic = opts.mnemonic;
    } else {
      _privates.mnemonic = bip39.generateMnemonic(englishWordlist);
    }

    // If we didn't explicit add a new account, we need attempt to autodiscover the rest
    if (opts?.autodiscover) {
      const { accountsEnabled } = await autoDiscoverAccounts({
        deriveWallet: _privates.deriveWallet,
      });
      _privates.accountsEnabled = accountsEnabled;
    }

    for (let i = 0; i < _privates.accountsEnabled; i++) {
      // Do not re-add deleted accounts
      if (!opts?.accountsDeleted?.includes(i)) {
        _privates.addAccount(i);
      }
    }
  }

  async addNewAccount(): Promise<Array<Wallet>> {
    const _privates = privates.get(this)!;

    _privates.addAccount(_privates.accountsEnabled);
    _privates.accountsEnabled += 1;
    return _privates.wallets.map(({ wallet }) => wallet);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addAccountAtIndex(index: number, address: Address): Promise<Address> {
    throw new Error('Method not implemented.');
  }

  getAccounts(): Promise<Array<Address>> {
    const _privates = privates.get(this)!;
    const addresses = _privates.wallets.map(({ wallet }) => wallet.address);
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = privates.get(this)!.getWalletForAddress(address);
    if (!wallet) throw new Error('Account not found');
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<string> {
    const { mnemonic } = privates.get(this)!;
    if (!mnemonic) throw new Error('No mnemonic');
    return mnemonic;
  }

  async removeAccount(address: Address): Promise<void> {
    const wallets = privates.get(this)!.wallets;

    const accountToDelete = wallets.find((w) => w.wallet.address === address);
    if (!accountToDelete) throw new Error('Account not found');

    const filteredList = wallets.filter((w) => w.wallet.address !== address);

    privates.get(this)!.wallets = filteredList;
    privates.get(this)!.accountsDeleted.push(accountToDelete.index);
  }
}
