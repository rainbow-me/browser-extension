import { ethers } from 'ethers';
import { expect, test } from 'vitest';

import { PrivateKey } from './IKeychain';

import {
  addNewAccount,
  createWallet,
  exportAccount,
  exportKeychain,
  getAccounts,
  getWallets,
  importWallet,
  isVaultUnlocked,
  lockVault,
  removeAccount,
  setVaultPassword,
  unlockVault,
  verifyPassword,
} from '.';

let privateKey = '';
let password = '';

test('[keychain/index] :: should be able to create an HD wallet', async () => {
  await createWallet();
  const accounts = await getAccounts();
  expect(accounts.length).toBe(1);
  expect(ethers.utils.isAddress(accounts[0])).toBe(true);
});

test('[keychain/index] :: should be able to add an account', async () => {
  let accounts = await getAccounts();
  const newAccount = await addNewAccount(accounts[0]);
  accounts = await getAccounts();
  expect(accounts.length).toBe(2);
  expect(newAccount).toEqual(accounts[1]);
  expect(ethers.utils.isAddress(accounts[1])).toBe(true);
});

test('[keychain/index] :: should be able to export a private key for an account', async () => {
  const accounts = await getAccounts();
  privateKey = (await exportAccount(accounts[1], password)) as PrivateKey;
  expect(ethers.utils.isBytesLike(privateKey)).toBe(true);
});

test('[keychain/index] :: should be able to remove an account from an HD keychain...', async () => {
  let accounts = await getAccounts();
  await removeAccount(accounts[1]);
  accounts = await getAccounts();
  expect(accounts.length).toBe(1);
});

test('[keychain/index] :: should be able to export the seed phrase for an HD wallet', async () => {
  const accounts = await getAccounts();
  const seedPhrase = await exportKeychain(accounts[0], password);
  expect(seedPhrase.split(' ').length).toBe(12);
});

test('[keychain/index] :: should be able to import a wallet using a private key', async () => {
  await importWallet(privateKey);
  const accounts = await getAccounts();
  expect(accounts.length).toBe(2);
  expect(ethers.utils.isAddress(accounts[1])).toBe(true);
});

test('[keychain/index] :: should be able to remove an account from a KeyPair keychain...', async () => {
  let accounts = await getAccounts();
  await removeAccount(accounts[1]);
  accounts = await getAccounts();
  expect(accounts.length).toBe(1);
});

test('[keychain/index] :: should be able to remove empty keychains', async () => {
  let accounts = await getAccounts();
  await removeAccount(accounts[0]);
  accounts = await getAccounts();
  expect(accounts.length).toBe(0);
});

test('[keychain/index] :: should be able to import a wallet using a seed phrase', async () => {
  let accounts = await getAccounts();
  await importWallet(
    'edge caught toy sniff enemy upon genre van tunnel make disorder home',
  );
  accounts = await getAccounts();
  expect(accounts.length).toBe(1);
  expect(ethers.utils.isAddress(accounts[0])).toBe(true);
});

test('[keychain/index] :: should be able to update the password of the vault', async () => {
  const oldPassword = password;
  password = 'newPassword';
  await setVaultPassword(oldPassword, password);
  expect(await verifyPassword(password)).toBe(true);
});

test('[keychain/index] :: should be able to lock the vault', async () => {
  await lockVault();
  expect(isVaultUnlocked()).toBe(false);
  expect((await getWallets()).length).toBe(0);
});

test('[keychain/index] :: should be able to unlock the vault', async () => {
  await unlockVault(password);
  expect(isVaultUnlocked()).toBe(true);
  expect((await getWallets()).length).toBe(1);
});

test('[keychain/index] :: should be able to autodiscover accounts when importing a seed phrase', async () => {
  let accounts = await getAccounts();
  await importWallet(
    'test test test test test test test test test test test junk',
  );

  accounts = await getAccounts();
  expect(accounts.length).toBeGreaterThan(2);
  expect(accounts[1]).equal('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  expect(accounts[2]).toBe('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  const privateKey1 = (await exportAccount(
    accounts[1],
    password,
  )) as PrivateKey;
  const privateKey2 = (await exportAccount(
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
