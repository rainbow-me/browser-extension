/* eslint-disable no-await-in-loop */
import Encryptor from '@metamask/browser-passworder';
import { Address } from 'wagmi';

import { KeychainType } from '../types/keychainTypes';

import {
  HardwareWalletKeychain,
  SerializedHardwareWalletKeychain,
} from './keychainTypes/hardwareWalletKeychain';
import { HdKeychain, SerializedHdKeychain } from './keychainTypes/hdKeychain';
import {
  KeyPairKeychain,
  SerializedKeypairKeychain,
} from './keychainTypes/keyPairKeychain';
import {
  ReadOnlyKeychain,
  SerializedReadOnlyKeychain,
} from './keychainTypes/readOnlyKeychain';

export type Keychain =
  | KeyPairKeychain
  | HdKeychain
  | ReadOnlyKeychain
  | HardwareWalletKeychain;

interface KeychainManagerState {
  keychains: Keychain[];
  isUnlocked: boolean;
  vault: string;
}

type SerializedKeychain =
  | SerializedHdKeychain
  | SerializedKeypairKeychain
  | SerializedReadOnlyKeychain
  | SerializedHardwareWalletKeychain;
type DecryptedVault = SerializedKeychain[];

const privates = new WeakMap();

class KeychainManager {
  state: KeychainManagerState;
  encryptor: typeof Encryptor;

  constructor() {
    this.state = {
      keychains: [],
      isUnlocked: false,
      vault: '',
    };
    this.encryptor = Encryptor;

    privates.set(this, {
      password: '',
      persist: () => {
        return Promise.all([
          privates.get(this).memorize(),
          privates.get(this).save(),
        ]);
      },

      rehydrate: async () => {
        // Attempt to read from memory first
        const memState = await privates.get(this).getLastMemorizedState();
        // If it's there, the keychain manager is already unlocked
        if (memState) {
          this.state.keychains = memState.keychains || [];
          this.state.isUnlocked = memState.isUnlocked || false;
          this.state.vault = memState.vault || '';
        }

        // Also attempt to read from storage for future unlocks
        const storageState = await privates.get(this).getLastStorageState();
        if (storageState) {
          this.state.vault = storageState.vault;
        }
      },

      memorize: () => {
        // This is all the keychains - password decrypted
        // IMPORTANT: Should never be stored in the fs!!!
        return chrome.storage.session.set({ keychainManager: this.state });
      },

      deriveAccounts: async (
        opts: SerializedKeypairKeychain | SerializedHdKeychain,
      ): Promise<Address[]> => {
        let keychain;
        switch (opts.type) {
          case KeychainType.HdKeychain:
            keychain = new HdKeychain();
            await keychain.init(opts as SerializedHdKeychain);
            break;
          case KeychainType.KeyPairKeychain:
            keychain = new KeyPairKeychain();
            await keychain.init(opts as SerializedKeypairKeychain);
            break;
          case KeychainType.ReadOnlyKeychain:
            keychain = new ReadOnlyKeychain();
            await keychain.init(opts as unknown as SerializedReadOnlyKeychain);
            break;
          case KeychainType.HardwareWalletKeychain:
            keychain = new HardwareWalletKeychain();
            await keychain.init(
              opts as unknown as SerializedHardwareWalletKeychain,
            );
            break;
          default:
            throw new Error('Keychain type not recognized.');
        }
        return keychain.getAccounts();
      },
      restoreKeychain: async (
        opts:
          | SerializedKeypairKeychain
          | SerializedHdKeychain
          | SerializedReadOnlyKeychain
          | SerializedHardwareWalletKeychain,
      ): Promise<Keychain> => {
        let keychain;
        switch (opts.type) {
          case KeychainType.HdKeychain:
            keychain = new HdKeychain();
            await keychain.init(opts as SerializedHdKeychain);
            break;
          case KeychainType.KeyPairKeychain:
            keychain = new KeyPairKeychain();
            await keychain.init(opts as SerializedKeypairKeychain);
            break;
          case KeychainType.ReadOnlyKeychain:
            keychain = new ReadOnlyKeychain();
            await keychain.init(opts as SerializedReadOnlyKeychain);
            break;
          case KeychainType.HardwareWalletKeychain:
            keychain = new HardwareWalletKeychain();
            await keychain.init(opts as SerializedHardwareWalletKeychain);
            break;
          default:
            throw new Error('Keychain type not recognized.');
        }
        await this.checkForDuplicateInKeychain(keychain);
        this.state.keychains.push(keychain as Keychain);
        await privates.get(this).persist();
        return keychain;
      },

      removeEmptyKeychainsIfNeeded: async () => {
        const nonEmptyKeychains = [];
        for (let i = 0; i < this.state.keychains.length; i++) {
          const accounts = await this.state.keychains[i].getAccounts();
          if (accounts.length > 0) {
            nonEmptyKeychains.push(this.state.keychains[i]);
          }
        }

        this.state.keychains = nonEmptyKeychains;
      },

      save: async () => {
        // Remove any potential empty keychains
        // Serialize all the keychains
        const serializedKeychains = this.state.keychains?.length
          ? await Promise.all(
              this.state.keychains?.map((keychain) => keychain.serialize()),
            )
          : [];

        // Encrypt the serialized keychains
        if (serializedKeychains.length > 0) {
          this.state.vault = await this.encryptor.encrypt(
            privates.get(this).password as string,
            serializedKeychains,
          );
        } else {
          this.state.vault = '';
        }
        // Store them in the fs
        return chrome.storage.local.set({ vault: this.state.vault });
      },

      getLastStorageState: () => {
        return chrome.storage.local.get('vault');
      },

      getLastMemorizedState: () => {
        return chrome.storage.session.get('keychainManager');
      },
    });

    privates.get(this).rehydrate();
  }

  async setPassword(password: string) {
    privates.get(this).password = password;
    this.state.isUnlocked = true;
    await privates.get(this).persist();
  }

  verifyPassword(password: string) {
    return privates.get(this).password === password;
  }

  async verifyPasswordViaDecryption(password: string) {
    if (!this.state.vault) {
      throw new Error('Nothing to unlock');
    }
    try {
      if (await this.encryptor.decrypt(password, this.state.vault)) {
        return true;
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return false;
  }

  async checkForDuplicateInKeychain(keychain: Keychain) {
    const existingAccounts = await this.getAccounts();
    const newAccounts = await keychain.getAccounts();
    for (let i = 0; i < newAccounts.length; i++) {
      if (existingAccounts.includes(newAccounts[i])) {
        throw new Error(`Duplicate account ${newAccounts[i]}`);
      }
    }

    return;
  }

  async addNewKeychain(opts?: unknown): Promise<Keychain> {
    const keychain = new HdKeychain();
    await keychain.init(opts as SerializedHdKeychain);
    await this.checkForDuplicateInKeychain(keychain);
    this.state.keychains.push(keychain as Keychain);
    this.state.isUnlocked = true;
    await privates.get(this).persist();
    return keychain;
  }

  async importKeychain(
    opts:
      | SerializedKeypairKeychain
      | SerializedHdKeychain
      | SerializedReadOnlyKeychain
      | SerializedHardwareWalletKeychain,
  ): Promise<Keychain> {
    return privates.get(this).restoreKeychain({
      ...opts,
      imported: true,
      autodiscover: true,
    });
  }

  async deriveAccounts(
    opts:
      | SerializedKeypairKeychain
      | SerializedHdKeychain
      | SerializedReadOnlyKeychain,
  ): Promise<Address[]> {
    return privates.get(this).deriveAccounts({
      ...opts,
      autodiscover: true,
    });
  }

  async exportAccount(address: Address, password: string) {
    const keychain = await this.getKeychain(address);
    if (!this.verifyPassword(password)) {
      throw new Error('Wrong password');
    }
    return await keychain.exportAccount(address);
  }

  async exportKeychain(address: Address, password: string) {
    const keychain = await this.getKeychain(address);
    if (!this.verifyPassword(password)) {
      throw new Error('Wrong password');
    }
    return await keychain.exportKeychain();
  }

  async addNewAccount(selectedKeychain: Keychain) {
    await selectedKeychain.addNewAccount();
    await privates.get(this).persist();
    const accounts = await selectedKeychain.getAccounts();
    return accounts[accounts.length - 1];
  }

  async removeAccount(address: Address) {
    for (let i = 0; i < this.state.keychains.length; i++) {
      const accounts = await this.state.keychains[i].getAccounts();
      if (accounts.includes(address)) {
        await this.state.keychains[i].removeAccount(address);
        await privates.get(this).removeEmptyKeychainsIfNeeded();
      }
    }
    await privates.get(this).persist();
  }

  async lock() {
    this.state.keychains = [];
    this.state.isUnlocked = false;
    privates.get(this).password = null;
    await privates.get(this).memorize();
  }

  async wipe(password: string) {
    if (!this.verifyPassword(password)) {
      throw new Error('Wrong password');
    }
    this.state.keychains = [];
    this.state.isUnlocked = false;
    this.state.vault = '';

    privates.get(this).password = '';

    await chrome.storage.local.set({ vault: null });
    await chrome.storage.session.set({ keychainManager: null });
  }

  async unlock(password: string) {
    if (!this.state.vault) {
      throw new Error('Nothing to unlock');
    }
    const vault: DecryptedVault = await this.encryptor.decrypt(
      password,
      this.state.vault,
    );
    privates.get(this).password = password;
    this.state.isUnlocked = true;
    await Promise.all(
      vault.map((serializedKeychain) => {
        return privates.get(this).restoreKeychain(serializedKeychain);
      }),
    );
    await privates.get(this).persist();
  }

  async getAccounts() {
    const keychains = this.state.keychains || [];

    const keychainArrays = await Promise.all(
      keychains.map((keychain) => keychain.getAccounts()),
    );
    const addresses = keychainArrays.reduce((res, arr) => {
      return res.concat(arr);
    }, []);

    return addresses;
  }

  async getWallets() {
    const keychains = this.state.keychains || [];

    const keychainArrays = [];
    for (let i = 0; i < keychains.length; i++) {
      const accounts = await keychains[i].getAccounts();
      keychainArrays.push({
        type: keychains[i].type as KeychainType,
        accounts,
        imported:
          keychains[i].type === KeychainType.HdKeychain
            ? (keychains[i] as HdKeychain).imported
            : false,
      });
    }
    return keychainArrays;
  }

  async getPath(address: Address) {
    const keychain = await this.getKeychain(address);
    if (keychain.type === 'HardwareWalletKeychain') {
      return (keychain as HardwareWalletKeychain).getPath(address);
    }
    throw new Error('Not implemented');
  }

  async getWallet(address: Address) {
    const keychain = await this.getKeychain(address);
    const accounts = await keychain.getAccounts();
    const wallet = {
      type: keychain.type as KeychainType,
      accounts,
      imported:
        keychain.type === KeychainType.HdKeychain
          ? (keychain as HdKeychain).imported
          : false,
    } as {
      vendor?: string;
      type: KeychainType;
      accounts: Address[];
      imported: boolean;
    };

    if (keychain.type === 'HardwareWalletKeychain') {
      wallet.vendor = (keychain as HardwareWalletKeychain).vendor as string;
    }

    return wallet;
  }

  async getKeychain(address: Address) {
    for (let i = 0; i < this.state.keychains.length; i++) {
      const keychain = this.state.keychains[i];
      const accounts = await keychain.getAccounts();
      if (accounts.includes(address)) {
        return keychain;
      }
    }
    throw new Error('No keychain found for account');
  }

  async getSigner(address: Address) {
    const keychain = await this.getKeychain(address);
    return keychain.getSigner(address);
  }
}

export const keychainManager = new KeychainManager();
Object.freeze(keychainManager);
