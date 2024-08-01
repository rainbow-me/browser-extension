import { isAddress } from '@ethersproject/address';
import { isBytesLike } from '@ethersproject/bytes';
import { Wallet } from '@ethersproject/wallet';
import { beforeAll, expect, test } from 'vitest';

import { delay } from '~/test/utils';

import { KeychainType } from '../types/keychainTypes';

import { PrivateKey } from './IKeychain';
import { keychainManager } from './KeychainManager';

let privateKey = '';
let password = '';

beforeAll(async () => {
  await delay(3000);
});

test('[keychain/KeychainManager] :: should be able to create an HD wallet', async () => {
  await keychainManager.addNewKeychain();
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
  expect(isAddress(accounts[0])).toBe(true);
});

test('[keychain/KeychainManager] :: should be able to add an account', async () => {
  let accounts = await keychainManager.getAccounts();
  const hdCreatedKeychain = await keychainManager.getKeychain(accounts[0]);
  await keychainManager.addNewAccount(hdCreatedKeychain);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(isAddress(accounts[1])).toBe(true);
});

test('[keychain/KeychainManager] :: should be able to export a private key for an account', async () => {
  const accounts = await keychainManager.getAccounts();
  privateKey = (await keychainManager.exportAccount(
    accounts[1],
    password,
  )) as PrivateKey;
  expect(isBytesLike(privateKey)).toBe(true);
});

test('[keychain/KeychainManager] :: should be able to remove an account from an HD keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
});

test('[keychain/KeychainManager] :: should be able to export the seed phrase for an HD wallet', async () => {
  const accounts = await keychainManager.getAccounts();
  const seedPhrase = await keychainManager.exportKeychain(
    accounts[0],
    password,
  );
  expect(seedPhrase.split(' ').length).toBe(12);
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
});

test('[keychain/KeychainManager] :: should be able to remove an account from a ReadOnly keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
});

test('[keychain/KeychainManager] :: should be able to import a wallet using a private key', async () => {
  await keychainManager.importKeychain({
    type: KeychainType.KeyPairKeychain,
    privateKey,
  });
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(isAddress(accounts[1])).toBe(true);
});

test('[keychain/KeychainManager] :: should be able to remove an account from a KeyPair keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
});

test('[keychain/KeychainManager] :: should be able to remove empty keychains', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[0]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(0);
  expect(keychainManager.state.keychains.length).toBe(0);
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
});

test('[keychain/KeychainManager] :: should be able to get the signer of a specific address', async () => {
  const accounts = await keychainManager.getAccounts();
  const signer = (await keychainManager.getSigner(accounts[0])) as Wallet;
  expect(signer._isSigner).toBe(true);
  expect(signer.address).toBe(accounts[0]);
  expect(signer.sendTransaction).toBeDefined();
});

test('[keychain/KeychainManager] :: should be able to update the password of the vault', async () => {
  password = 'newPassword';
  await keychainManager.setPassword(password);
  expect(await keychainManager.verifyPassword(password)).toBe(true);
});

test('[keychain/KeychainManager] :: should be able to lock the vault', async () => {
  await keychainManager.lock();
  expect(keychainManager.state.isUnlocked).toBe(false);
  expect(keychainManager.state.keychains.length).toBe(0);
});

test('[keychain/KeychainManager] :: should be able to unlock the vault', async () => {
  await keychainManager.unlock(password);
  expect(keychainManager.state.isUnlocked).toBe(true);
  expect(keychainManager.state.keychains.length).toBe(1);
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
});
