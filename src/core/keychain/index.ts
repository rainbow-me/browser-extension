/* eslint-disable no-await-in-loop */
import Encryptor from '@metamask/browser-passworder';
import { Address } from 'wagmi';

import { HdKeychain, SerializedHdKeychain } from './keychainTypes/hdKeychain';
import {
  KeyPairKeychain,
  SerializedKeypairKeychain,
} from './keychainTypes/keyPairKeychain';

type Keychain = KeyPairKeychain | HdKeychain;

interface KeychainManagerState {
  keychains: Keychain[];
  password: string | null;
  isUnlocked: boolean;
  vault: string;
}

type SerializedKeychain = SerializedHdKeychain | SerializedKeypairKeychain;
type DecryptedVault = SerializedKeychain[];

class KeychainManager {
  state: KeychainManagerState;
  encryptor: typeof Encryptor;

  constructor() {
    this.state = {
      keychains: [],
      password: '',
      isUnlocked: false,
      vault: '',
    };
    this.encryptor = Encryptor;
    this.#rehydrate();
  }

  async updatePassword(password: string) {
    this.state.password = password;
    await this.#persist();
  }

  async addNewKeychain(type: string, opts: unknown) {
    let keychain;
    switch (type) {
      case 'HdKeychain':
        keychain = new HdKeychain();
        await keychain.init(opts as SerializedHdKeychain);
        break;
      default:
        throw new Error('Keychain type not recognized.');
    }
    this.state.keychains.push(keychain as Keychain);
    this.state.isUnlocked = true;
    await this.#persist();
  }

  async importKeychain(opts: SerializedKeypairKeychain | SerializedHdKeychain) {
    return this.#restoreKeychain({
      ...opts,
      imported: true,
      autodiscover: true,
    });
  }

  async exportAccount(address: Address) {
    const keychain = await this.getKeychain(address);
    return await keychain.exportAccount(address);
  }

  async exportKeychain(address: Address) {
    const keychain = await this.getKeychain(address);
    return await keychain.exportKeychain();
  }

  async addNewAccount(selectedKeychain: Keychain) {
    await selectedKeychain.addNewAccount();
    await this.#persist();
  }

  async removeAccount(address: Address) {
    for (let i = 0; i < this.state.keychains.length; i++) {
      const accounts = await this.state.keychains[i].getAccounts();
      if (accounts.includes(address)) {
        await this.state.keychains[i].removeAccount(address);
        await this.#removeEmptyKeychainsIfNeeded();
      }
    }
    await this.#persist();
  }

  async lock() {
    const newState = {
      password: null,
      isUnlocked: false,
      keychains: [],
    };
    this.state = {
      ...this.state,
      ...newState,
    };
    await this.#memorize();
  }

  async unlock(password: string) {
    if (!this.state.vault) {
      throw new Error('Nothing to unlock');
    }
    const vault: DecryptedVault = await this.encryptor.decrypt(
      password,
      this.state.vault,
    );
    this.state.password = password;
    this.state.isUnlocked = true;
    await Promise.all(
      vault.map((serializedKeychain) => {
        return this.#restoreKeychain(serializedKeychain);
      }),
    );
    await this.#persist();
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

  async #restoreKeychain(
    opts: SerializedKeypairKeychain | SerializedHdKeychain,
  ) {
    let keychain;
    switch (opts.type) {
      case 'HdKeychain':
        keychain = new HdKeychain();
        await keychain.init(opts as SerializedHdKeychain);
        break;
      case 'KeyPairKeychain':
        keychain = new KeyPairKeychain();
        await keychain.init(opts as SerializedKeypairKeychain);
        break;
      default:
        throw new Error('Keychain type not recognized.');
    }
    this.state.keychains.push(keychain as Keychain);
    await this.#persist();
  }

  #persist() {
    return Promise.all([this.#memorize(), this.#save()]);
  }

  async #rehydrate() {
    // Attempt to read from memory first
    const memState = await this.#getLastMemorizedState();
    // If it's there, the keychain manager is already unlocked
    if (memState) {
      this.state = {
        ...this.state,
        ...memState,
      };
    }

    // Also ttempt to read from storage for future unlocks
    const storageState = await this.#getLastStorageState();
    if (storageState) {
      this.state.vault = storageState.vault;
    }
  }

  #memorize() {
    // This is all the keychains - password decrypted
    // IMPORTANT: Should never be stored in the fs!!!
    return chrome.storage.session.set({ keychainManager: this.state });
  }

  async #removeEmptyKeychainsIfNeeded() {
    const nonEmptyKeychains = [];
    for (let i = 0; i < this.state.keychains.length; i++) {
      const accounts = await this.state.keychains[i].getAccounts();
      if (accounts.length > 0) {
        nonEmptyKeychains.push(this.state.keychains[i]);
      }
    }

    this.state.keychains = nonEmptyKeychains;
  }

  async #save() {
    // Remove any potential empty keychains
    // Serialize all the keychains
    const serializedKeychains = await Promise.all(
      this.state.keychains.map((keychain) => keychain.serialize()),
    );

    // Encrypt the serialized keychains
    if (serializedKeychains.length > 0) {
      this.state.vault = await this.encryptor.encrypt(
        this.state.password as string,
        serializedKeychains,
      );
    } else {
      this.state.vault = '';
    }
    // Store them in the fs
    return chrome.storage.local.set({ vault: this.state.vault });
  }

  #getLastStorageState() {
    return chrome.storage.local.get('vault');
  }

  #getLastMemorizedState() {
    return chrome.storage.session.get('keychainManager');
  }
}

export const keychainManager = new KeychainManager();
