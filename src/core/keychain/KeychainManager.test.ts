import { Wallet } from '@ethersproject/wallet';
import { isAddress, isHex } from 'viem';
import { beforeAll, expect, test, vi } from 'vitest';

import { delay } from '~/test/utils';

import { KeychainType } from '../types/keychainTypes';

import type { PrivateKey } from './IKeychain';
import { keychainManager } from './KeychainManager';

vi.stubGlobal('crypto', {
  // deterministic bytes
  getRandomValues: (arr: ArrayBufferView) => {
    const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < u8.length; i++) u8[i] = i & 0xff;
    return arr;
  },
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
  subtle: globalThis.crypto?.subtle,
});

vi.mock('@scure/bip39', async () => {
  const actual =
    await vi.importActual<typeof import('@scure/bip39')>('@scure/bip39');
  return {
    ...actual,
    generateMnemonic: (): string =>
      'test test test test test test test test test test test junk',
  };
});

// Mock the aha network module for autodiscovery
vi.mock('~/core/network/aha', () => ({
  ahaHttp: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: {
          addresses: {
            // Mark first 2 addresses as used for autodiscovery
            '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': true,
            '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': true,
          },
        },
      },
    }),
  },
}));

// Mock storage implementation - hoisted to be available before module initialization
const mockStorage = vi.hoisted(() => ({
  local: new Map<string, unknown>(),
  session: new Map<string, unknown>(),
}));

// Keychain-relevant storage keys
const KEYCHAIN_STORAGE_KEYS = {
  local: ['vault'],
  session: ['salt', 'encryptionKey', 'keychainManager'],
} as const;

const captureStorageSnapshot = () => ({
  local: Object.fromEntries(
    KEYCHAIN_STORAGE_KEYS.local
      .filter((key) => mockStorage.local.has(key))
      .map((key) => [key, mockStorage.local.get(key)]),
  ),
  session: Object.fromEntries(
    KEYCHAIN_STORAGE_KEYS.session
      .filter((key) => mockStorage.session.has(key))
      .map((key) => [key, mockStorage.session.get(key)]),
  ),
});

const expectStorageSnapshot = () => {
  expect(captureStorageSnapshot()).toMatchSnapshot();
};

// Mock the storage module
vi.mock('~/core/storage', () => ({
  LocalStorage: {
    async clear() {
      mockStorage.local.clear();
    },
    async set<TValue = unknown>(key: string, value: TValue) {
      mockStorage.local.set(key, value);
    },
    async get<TValue = unknown>(key: string) {
      return mockStorage.local.get(key) as TValue;
    },
    async remove(key: string) {
      mockStorage.local.delete(key);
    },
    async listen() {
      // Mock implementation - return a no-op cleanup function
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    },
  },
  SessionStorage: {
    async clear() {
      mockStorage.session.clear();
    },
    async set(key: string, value: unknown) {
      mockStorage.session.set(key, value);
    },
    async get(key: string) {
      return mockStorage.session.get(key);
    },
    async remove(key: string) {
      mockStorage.session.delete(key);
    },
    async listen() {
      // Mock implementation - return a no-op cleanup function
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    },
  },
}));

let privateKey = '' as PrivateKey;
let password = '';

beforeAll(async () => {
  await delay(3000);
});

test('[keychain/KeychainManager] :: should be able to create an HD wallet', async () => {
  await keychainManager.addNewKeychain();
  // introduce password, without this the vault will not be persisted
  await keychainManager.setPassword('test');
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
  expect(isAddress(accounts[0])).toBe(true);

  // Snapshot test: storage state after creating HD wallet
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to add an account', async () => {
  let accounts = await keychainManager.getAccounts();
  const hdCreatedKeychain = await keychainManager.getKeychain(accounts[0]);
  await keychainManager.addNewAccount(hdCreatedKeychain);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(isAddress(accounts[1])).toBe(true);

  // Snapshot test: storage state after adding account
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to export a private key for an account', async () => {
  const accounts = await keychainManager.getAccounts();
  privateKey = (await keychainManager.exportAccount(
    accounts[1],
    password,
  )) as PrivateKey;
  expect(isHex(privateKey)).toBe(true);

  // Snapshot test: storage state after exporting private key
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to remove an account from an HD keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);

  // Snapshot test: storage state after removing account
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to export the seed phrase for an HD wallet', async () => {
  const accounts = await keychainManager.getAccounts();
  const seedPhrase = await keychainManager.exportKeychain(
    accounts[0],
    password,
  );
  expect(seedPhrase.split(' ').length).toBe(12);

  // Snapshot test: storage state after exporting seed phrase
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to add a read only wallet using an address', async () => {
  await keychainManager.importKeychain({
    type: KeychainType.ReadOnlyKeychain,
    address: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  });
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(isAddress(accounts[1])).toBe(true);
  expect(accounts[1]).toBe('0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4');

  // Snapshot test: storage state after adding read-only wallet
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to remove an account from a ReadOnly keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);

  // Snapshot test: storage state after removing read-only account
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to import a wallet using a private key', async () => {
  await keychainManager.importKeychain({
    type: KeychainType.KeyPairKeychain,
    privateKey,
  });
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(isAddress(accounts[1])).toBe(true);

  // Snapshot test: storage state after importing private key wallet
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to remove an account from a KeyPair keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);

  // Snapshot test: storage state after removing private key account
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to remove empty keychains', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[0]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(0);
  expect(keychainManager.state.keychains.length).toBe(0);

  // Snapshot test: storage state after removing all keychains
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to import a wallet using a seed phrase', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.importKeychain({
    type: KeychainType.HdKeychain,
    mnemonic:
      'edge caught toy sniff enemy upon genre van tunnel make disorder home',
  });
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
  expect(isAddress(accounts[0])).toBe(true);

  // Snapshot test: storage state after importing seed phrase wallet
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to get the signer of a specific address', async () => {
  const accounts = await keychainManager.getAccounts();
  const signer = (await keychainManager.getSigner(accounts[0])) as Wallet;
  expect(signer._isSigner).toBe(true);
  expect(signer.address).toBe(accounts[0]);
  expect(signer.sendTransaction).toBeDefined();

  // Snapshot test: storage state after getting signer
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to update the password of the vault', async () => {
  password = 'newPassword';
  await keychainManager.setPassword(password);
  expect(await keychainManager.verifyPassword(password)).toBe(true);

  // Snapshot test: storage state after updating password
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to lock the vault', async () => {
  await keychainManager.lock();
  expect(keychainManager.state.isUnlocked).toBe(false);
  expect(keychainManager.state.keychains.length).toBe(0);

  // Snapshot test: storage state after locking vault
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to unlock the vault', async () => {
  await keychainManager.unlock(password);
  expect(keychainManager.state.isUnlocked).toBe(true);
  expect(keychainManager.state.keychains.length).toBe(1);

  // Snapshot test: storage state after unlocking vault
  expectStorageSnapshot();
});

test('[keychain/KeychainManager] :: should be able to autodiscover accounts when importing a seed phrase', async () => {
  let accounts = await keychainManager.getAccounts();
  expect(keychainManager.state.keychains.length).toBe(1);
  await keychainManager.importKeychain({
    type: KeychainType.HdKeychain,
    mnemonic: 'test test test test test test test test test test test junk',
  });
  expect(keychainManager.state.keychains.length).toBe(2);

  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBeGreaterThan(2);
  expect(accounts[1]).equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  expect(accounts[2]).toBe('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  const privateKey1 = (await keychainManager.exportAccount(
    accounts[1],
    password,
  )) as PrivateKey;
  const privateKey2 = (await keychainManager.exportAccount(
    accounts[2],
    password,
  )) as PrivateKey;

  expect(privateKey1).equal(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  );
  expect(privateKey2).equal(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  );

  // Snapshot test: storage state after autodiscovering accounts
  expectStorageSnapshot();
});
