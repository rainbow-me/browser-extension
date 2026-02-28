/* eslint-disable no-await-in-loop */
import {
  decrypt,
  decryptWithDetail,
  decryptWithKey,
  encryptWithDetail,
  encryptWithKey,
  importKey,
} from '@metamask/browser-passworder';
import * as Sentry from '@sentry/react';
import { Address } from 'viem';

import { RainbowError, logger } from '~/logger';

import { LocalStorage, SessionStorage } from '../storage';
import { KeychainType } from '../types/keychainTypes';
import { isLowerCaseMatch } from '../utils/strings';

import {
  HardwareWalletKeychain,
  type HardwareWalletVendor,
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

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

export type Keychain =
  | KeyPairKeychain
  | HdKeychain
  | ReadOnlyKeychain
  | HardwareWalletKeychain;

interface KeychainManagerState {
  keychains: Keychain[];
  isUnlocked: boolean;
  initialized: boolean;
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

  constructor() {
    this.state = {
      initialized: false,
      keychains: [],
      isUnlocked: false,
      vault: '',
    };

    privates.set(this, {
      password: '',
      rehydrate: async () => {
        try {
          // Get the vault from storage
          const vault = await privates.get(this).getLastStorageState();
          if (vault) {
            this.state.vault = vault;
          }

          const encryptionKey = await privates.get(this).getEncryptionKey();
          if (encryptionKey) {
            const key = await importKey(encryptionKey);
            const vault = (await decryptWithKey(
              key,
              JSON.parse(this.state.vault) as Awaited<
                ReturnType<typeof encryptWithKey>
              >,
            )) as DecryptedVault;

            await Promise.all(
              vault.map((serializedKeychain) => {
                return privates.get(this).restoreKeychain(serializedKeychain);
              }),
            );
            await privates.get(this).persist();
            this.state.isUnlocked = true;
          }
        } catch (e) {
          logger.error(
            new RainbowError('Fatal error: rehydration failed', {
              cause: e,
            }),
          );
        } finally {
          this.state.initialized = true;
        }
      },
      deriveAccounts: async (opts: SerializedKeychain): Promise<Address[]> => {
        let keychain;
        switch (opts.type) {
          case KeychainType.HdKeychain:
            keychain = new HdKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.KeyPairKeychain:
            keychain = new KeyPairKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.ReadOnlyKeychain:
            keychain = new ReadOnlyKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.HardwareWalletKeychain:
            keychain = new HardwareWalletKeychain();
            await keychain.init(opts);
            break;
          default:
            throw new Error('Keychain type not recognized.');
        }
        return keychain.getAccounts();
      },
      restoreKeychain: async (opts: SerializedKeychain): Promise<Keychain> => {
        let keychain;
        switch (opts.type) {
          case KeychainType.HdKeychain:
            keychain = new HdKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.KeyPairKeychain:
            keychain = new KeyPairKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.ReadOnlyKeychain:
            keychain = new ReadOnlyKeychain();
            await keychain.init(opts);
            break;
          case KeychainType.HardwareWalletKeychain:
            keychain = new HardwareWalletKeychain();
            await keychain.init(opts);
            break;
          default:
            throw new Error('Keychain type not recognized.');
        }
        await this.mergeKeychains(keychain);
        await this.checkForDuplicateInKeychain(keychain);
        privates
          .get(this)
          .setKeychains([...this.state.keychains, keychain as Keychain]);
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

        privates.get(this).setKeychains(nonEmptyKeychains);
      },

      persist: async () => {
        // Serialize all the keychains
        let serializedKeychains = this.state.keychains?.length
          ? await Promise.all(
              this.state.keychains?.map((keychain) => keychain?.serialize()),
            )
          : [];

        // Remove any potential empty keychains
        serializedKeychains = serializedKeychains.filter((k) => !!k);

        // Encrypt the serialized keychains
        const pwd = privates.get(this).password;
        const encryptionKey = await privates.get(this).getEncryptionKey();
        const salt = await privates.get(this).getSalt();

        if (serializedKeychains.length > 0) {
          const result = { vault: '', exportedKeyString: '', salt: '' };
          // hasKeychains is automatically maintained by setKeychains setter
          if (pwd) {
            // Generate a new encryption key every time we save and have a password
            const encryptionResult = await encryptWithDetail(
              privates.get(this).password as string,
              serializedKeychains,
            );
            result.vault = encryptionResult.vault;
            result.exportedKeyString = encryptionResult.exportedKeyString;
            const vaultObj = JSON.parse(encryptionResult.vault) as Awaited<
              ReturnType<typeof decryptWithDetail>
            >;
            result.salt = vaultObj.salt;
          } else if (encryptionKey && salt) {
            const key = await importKey(encryptionKey);
            const vaultObj = await encryptWithKey(key, serializedKeychains);
            result.vault = JSON.stringify({ ...vaultObj, salt });
            result.salt = salt;
            result.exportedKeyString = encryptionKey;
          }

          // Only persist if we have a password or encryptionKey/salt
          // Without encryption, we can't securely store the vault
          if (result.vault) {
            this.state.vault = result.vault;
            await privates.get(this).setEncryptionKey(result.exportedKeyString);
            await privates.get(this).setSalt(result.salt);
            // Use centralized vault setter - vault is non-empty, safe to persist
            await privates.get(this)._setVaultInStorage(result.vault);
          }
        }
      },

      setSalt: (val: string | null) => {
        return SessionStorage.set('salt', val);
      },
      getSalt: () => {
        return SessionStorage.get('salt');
      },
      setEncryptionKey: (val: string | null) => {
        return SessionStorage.set('encryptionKey', val);
      },
      getEncryptionKey: () => {
        return SessionStorage.get('encryptionKey');
      },
      /**
       * Sets the keychains array and automatically updates hasKeychains in SessionStorage.
       * This ensures hasKeychains is always in sync with the actual keychains state.
       */
      setKeychains: (keychains: Keychain[]) => {
        this.state.keychains = keychains;
        // Update hasKeychains based on whether we have any keychains
        void SessionStorage.set(
          'hasKeychains',
          keychains.length > 0 ? true : null,
        );
      },

      getLastStorageState: () => {
        return LocalStorage.get('vault');
      },

      /**
       * Centralized method to set vault in storage.
       * This is the ONLY place where vault should be written to storage.
       *
       * @param vaultValue - The vault value to store. Can be:
       *   - A non-empty string (encrypted vault)
       *   - An empty string '' (only allowed if allowEmpty is true)
       *   - null (only allowed if allowNull is true)
       * @param allowEmpty - Allow setting vault to empty string (default: false)
       * @param allowNull - Allow setting vault to null (default: false)
       */
      _setVaultInStorage: async (
        vaultValue: string | null,
        allowEmpty = false,
        allowNull = false,
      ) => {
        // Safety check: prevent accidentally clearing vault
        if (vaultValue === null && !allowNull) {
          logger.error(
            new RainbowError(
              'Attempted to set vault to null without explicit permission',
            ),
          );
          throw new Error(
            'Cannot set vault to null. Use wipe() method if you intend to clear the vault.',
          );
        }

        // Safety check: prevent accidentally clearing vault with empty string
        if (vaultValue === '' && !allowEmpty) {
          const existingVault = await privates.get(this).getLastStorageState();
          if (existingVault && existingVault !== '') {
            logger.error(
              new RainbowError(
                'Attempted to set vault to empty string without explicit permission',
              ),
              {
                existingVaultLength: existingVault.length,
                keychainsCount: this.state.keychains.length,
              },
            );
            throw new Error(
              'Cannot set vault to empty string when vault exists. Use wipe() method if you intend to clear the vault.',
            );
          }
        }

        // Update state
        this.state.vault = vaultValue || '';

        // Persist to storage
        // This is the ONLY allowed place to call LocalStorage.set('vault', ...)
        // eslint-disable-next-line no-restricted-syntax
        await LocalStorage.set('vault', this.state.vault);
      },
    });

    privates.get(this).rehydrate();
  }

  async setPassword(password: string) {
    privates.get(this).password = password;
    this.state.isUnlocked = true;
    await privates.get(this).persist();
  }

  async verifyPassword(password: string) {
    try {
      // Check if we haven't set a password yet
      if (
        this.state.vault === '' &&
        password === '' &&
        this.state.keychains.length > 0
      ) {
        return true;
      }

      if (await decrypt(password, this.state.vault)) {
        return true;
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return false;
  }

  async hasVaultInStorage() {
    if (this.state.vault) {
      return true;
    } else {
      const vault = await privates.get(this).getLastStorageState();
      if (vault) {
        return true;
      }
    }
    return false;
  }

  async mergeKeychains(incomingKeychain: Keychain) {
    if (incomingKeychain.type === KeychainType.ReadOnlyKeychain) return;

    const currentAccounts = await this.getAccounts();
    const incomingAccounts = await incomingKeychain.getAccounts();
    const conflictingAccounts = incomingAccounts.filter((acc) =>
      currentAccounts.includes(acc),
    );

    for (const account of conflictingAccounts) {
      const wallet = await this.getWallet(account);
      // the incoming is not readOnly, so if the conflicting is, remove it to leave the one with higher privilages
      // if the incoming is a hd wallet that derives an account in which the pk is already in the vault, remove this pk to leave the hd as the main
      if (
        wallet.type === KeychainType.ReadOnlyKeychain ||
        (incomingKeychain.type === KeychainType.HdKeychain &&
          wallet.type === KeychainType.KeyPairKeychain)
      ) {
        this.removeAccount(account);
      }
    }
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

  async checkForImportedDuplicateInKeychain(keychain: Keychain) {
    const existingAccounts = await this.getAccounts();
    const newAccounts = await keychain.getAccounts();
    for (let i = 0; i < newAccounts.length; i++) {
      const matchingExistingAccount = existingAccounts.find((existingAccount) =>
        isLowerCaseMatch(existingAccount, newAccounts[i]),
      );
      if (matchingExistingAccount) {
        const existingAccountWallet = await this.getWallet(
          matchingExistingAccount,
        );
        if (existingAccountWallet.type !== KeychainType.ReadOnlyKeychain) {
          throw new Error(`Duplicate account ${newAccounts[i]}`);
        }
      }
    }
    return;
  }

  async addNewKeychain(opts?: unknown): Promise<Keychain> {
    const keychain = new HdKeychain();
    await keychain.init(opts as SerializedHdKeychain);
    await this.checkForImportedDuplicateInKeychain(keychain);
    // Use setter to ensure hasKeychains is updated
    privates
      .get(this)
      .setKeychains([...this.state.keychains, keychain as Keychain]);
    this.state.isUnlocked = true;
    await privates.get(this).persist();
    return keychain;
  }

  async removeKeychain(keychain: Keychain) {
    // This function is only called when a 1 account keychain needs removal, because the account moved to a different keychain
    // example: you watch an account (read-only keychain), and then you that watched account to a different keychain (hd keychain), the read-only keychain is no longer needed
    // given the above, it should be guaranteed that at least one keychain will always exist after removing one
    const newKeychains = this.state.keychains.filter((k) => k !== keychain);
    if (newKeychains.length === 0) {
      throw new Error(
        'The last keychain cannot be removed using this method, use `wipe()` instead.',
      );
    }
    privates.get(this).setKeychains(newKeychains);
  }

  async isMnemonicInVault(mnemonic: string) {
    for (const k of this.state.keychains) {
      if (k.type !== KeychainType.HdKeychain) continue;
      if ((await k.exportKeychain()) === mnemonic) return true;
    }
    return false;
  }

  async importKeychain(opts: SerializedKeychain): Promise<Keychain> {
    if (opts.type === KeychainType.KeyPairKeychain) {
      const newAccount = (await this.deriveAccounts(opts))[0];
      const existingAccounts = await this.getAccounts();
      if (existingAccounts.includes(newAccount)) {
        const existingKeychain = await this.getKeychain(newAccount);
        // if the account is already in the vault (like in a hd keychain), we don't want to import it again
        // UNLESS it's a readOnlyKeychain, which we DO WANT to override it, importing the pk
        if (existingKeychain.type !== KeychainType.ReadOnlyKeychain)
          return existingKeychain;
      }
    }

    const result = await privates.get(this).restoreKeychain({
      ...opts,
      imported: true,
      autodiscover: true,
    });
    await privates.get(this).persist();
    return result;
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

  async addAccountAtIndex(
    selectedKeychain: Keychain,
    index: number,
    address: Address,
    hdPath?: string,
  ) {
    selectedKeychain.addAccountAtIndex(index, address, hdPath);
    await privates.get(this).persist();
    return address;
  }

  async removeAccount(address: Address) {
    for (let i = 0; i < this.state.keychains.length; i++) {
      const accounts = await this.state.keychains[i].getAccounts();
      if (accounts.includes(address)) {
        await this.state.keychains[i].removeAccount(address);
        await privates.get(this).removeEmptyKeychainsIfNeeded();
      }
    }
    // If all keychains were removed, explicitly wipe the vault
    if (this.state.keychains.length === 0) {
      await this.wipe();
    } else {
      await privates.get(this).persist();
    }
  }

  async lock() {
    privates.get(this).setKeychains([]);
    this.state.isUnlocked = false;
    privates.get(this).password = null;
    await privates.get(this).setEncryptionKey(null);
    await privates.get(this).setSalt(null);
  }

  async wipe() {
    if (!this.state.isUnlocked && !!privates.get(this).password) return;
    privates.get(this).setKeychains([]);
    this.state.isUnlocked = false;
    this.state.vault = '';

    privates.get(this).password = '';

    // Use centralized vault setter - explicitly allow null for wipe operation
    await privates.get(this)._setVaultInStorage(null, false, true);
    await privates.get(this).setEncryptionKey(null);
    await privates.get(this).setSalt(null);
  }

  async unlock(password: string) {
    if (!this.state.vault) {
      throw new Error('Nothing to unlock');
    }

    const {
      vault: decryptedVault,
      exportedKeyString,
      salt,
    } = await decryptWithDetail(password, this.state.vault);

    await privates.get(this).setEncryptionKey(exportedKeyString);
    await privates.get(this).setSalt(salt);
    privates.get(this).password = password;
    this.state.isUnlocked = true;

    await Promise.all(
      (decryptedVault as SerializedKeychain[]).map((serializedKeychain) => {
        return privates.get(this).restoreKeychain(serializedKeychain);
      }),
    );
    await privates.get(this).persist();
  }

  async getAccounts() {
    const keychains = this.state.keychains || [];
    const accounts = await Promise.all(
      keychains.map((keychain) => keychain.getAccounts()),
    );
    return accounts.flat();
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
        vendor:
          keychains[i].type === KeychainType.HardwareWalletKeychain
            ? (keychains[i] as HardwareWalletKeychain).vendor
            : undefined,
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
      vendor?: HardwareWalletVendor;
      type: KeychainType;
      accounts: Address[];
      imported: boolean;
    };

    if (keychain.type === 'HardwareWalletKeychain') {
      wallet.vendor = (keychain as HardwareWalletKeychain).vendor as
        | 'Ledger'
        | 'Trezor';
    }

    return wallet;
  }

  async getKeychain(address: Address) {
    if (!this.state.initialized) {
      throw new Error('Keychain manager not initialized');
    }
    if (!this.state.isUnlocked) {
      throw new Error('Keychain locked for account');
    }
    for (let i = 0; i < this.state.keychains.length; i++) {
      const keychain = this.state.keychains[i];
      const accounts = await keychain.getAccounts();
      if (accounts.includes(address)) {
        return keychain;
      }
    }
    if (INTERNAL_BUILD || IS_TESTING) {
      const addressesByKeychain = await Promise.all(
        this.state.keychains.map(async (keychain) => {
          return {
            keychainType: keychain.type,
            accounts: (await keychain.getAccounts()).map((account) =>
              account.replace('0x', 'x0000'),
            ),
          };
        }),
      );
      Sentry.addBreadcrumb({
        message: `Keychain not found for account: ${address.replace(
          '0x',
          'x0000',
        )}`,
        data: {
          keychainAmount: this.state.keychains.length,
          addressesByKeychain,
          timestamp: new Date().toISOString(),
        },
      });
    }
    throw new Error('No keychain found for account');
  }
}

export const keychainManager = new KeychainManager();
Object.freeze(keychainManager);
