import { ethers, Wallet } from 'ethers';
import { expect, test } from 'vitest';
import { keychainManager } from '.';
import { PrivateKey } from './iKeychain';

let privateKey = '';

test('should be able to create an HD wallet', async () => {
  await keychainManager.addNewKeychain('HdKeychain', {});
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
  expect(ethers.utils.isAddress(accounts[0])).toBe(true);
});

test('should be able to add an account', async () => {
  let accounts = await keychainManager.getAccounts();
  const hdCreatedKeychain = await keychainManager.getKeychain(accounts[0]);
  await keychainManager.addNewAccount(hdCreatedKeychain);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(ethers.utils.isAddress(accounts[1])).toBe(true);
});

test('should be able to export a private key for an account', async () => {
  const accounts = await keychainManager.getAccounts();
  privateKey = (await keychainManager.exportAccount(accounts[1])) as PrivateKey;
  expect(ethers.utils.isBytesLike(privateKey)).toBe(true);
});

test('should be able to remove an account from an HD keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
});

test('should be able to export the seed phrase for an HD wallet', async () => {
  const accounts = await keychainManager.getAccounts();
  const seedPhrase = await keychainManager.exportKeychain(accounts[0]);
  expect(seedPhrase.split(' ').length).toBe(12);
});

test('should be able to import a wallet using a private key', async () => {
  await keychainManager.importKeychain({ type: 'KeyPairKeychain', privateKey });
  const accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(2);
  expect(ethers.utils.isAddress(accounts[1])).toBe(true);
});

test('should be able to remove an account from a KeyPair keychain...', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[1]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
});

test('should be able to remove empty keychains', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.removeAccount(accounts[0]);
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(0);
  expect(keychainManager.state.keychains.length).toBe(0);
});

test('should be able to import a wallet using a seed phrase', async () => {
  let accounts = await keychainManager.getAccounts();
  await keychainManager.addNewKeychain('HdKeychain', {
    mnemonic:
      'edge caught toy sniff enemy upon genre van tunnel make disorder home',
  });
  accounts = await keychainManager.getAccounts();
  expect(accounts.length).toBe(1);
  expect(ethers.utils.isAddress(accounts[0])).toBe(true);
});

test('should be able to get the signer of a specific address', async () => {
  const accounts = await keychainManager.getAccounts();
  const signer = (await keychainManager.getSigner(accounts[0])) as Wallet;
  expect(signer).toBeInstanceOf(ethers.Wallet);
  expect(signer.address).toBe(accounts[0]);
  expect(signer.sendTransaction).toBeDefined();
});

test('should be able to update the password of the vault', async () => {
  await keychainManager.updatePassword('password');
  expect(keychainManager.state.password).toBe('password');
});

test('should be able to lock the vault', async () => {
  await keychainManager.lock();
  expect(keychainManager.state.isUnlocked).toBe(false);
  expect(keychainManager.state.password).toBe(null);
  expect(keychainManager.state.keychains.length).toBe(0);
});

test('should be able to unlock the vault', async () => {
  await keychainManager.unlock('password');
  expect(keychainManager.state.isUnlocked).toBe(true);
  expect(keychainManager.state.password).toBe('password');
  expect(keychainManager.state.keychains.length).toBe(1);
});
