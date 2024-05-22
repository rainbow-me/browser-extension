import { getAddress, isAddress } from '@ethersproject/address';
import { isBytesLike, isHexString } from '@ethersproject/bytes';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import { verifyMessage } from '@ethersproject/wallet';
import {
  MessageTypes,
  SignTypedDataVersion,
  TypedMessage,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import { mainnet } from 'viem/chains';
import { beforeAll, expect, test } from 'vitest';

import { delay } from '~/test/utils';

import { connectedToHardhatStore } from '../state/currentSettings/connectedToHardhat';
import { updateWagmiConfig } from '../wagmi';

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
  sendTransaction,
  setVaultPassword,
  signMessage,
  signTypedData,
  unlockVault,
  verifyPassword,
} from '.';

let privateKey = '';
let password = '';

beforeAll(async () => {
  connectedToHardhatStore.setState({ connectedToHardhat: true });
  updateWagmiConfig([mainnet]);
  await delay(3000);
});

test('[keychain/index] :: should be able to create an HD wallet', async () => {
  await createWallet();
  const accounts = await getAccounts();
  expect(accounts.length).toBe(1);
  expect(isAddress(accounts[0])).toBe(true);
});

test('[keychain/index] :: should be able to add an account', async () => {
  let accounts = await getAccounts();
  const newAccount = await addNewAccount(accounts[0]);
  accounts = await getAccounts();
  expect(accounts.length).toBe(2);
  expect(newAccount).toEqual(accounts[1]);
  expect(isAddress(accounts[1])).toBe(true);
});

test('[keychain/index] :: should be able to export a private key for an account', async () => {
  const accounts = await getAccounts();
  privateKey = (await exportAccount(accounts[1], password)) as PrivateKey;
  expect(isBytesLike(privateKey)).toBe(true);
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
  expect(isAddress(accounts[1])).toBe(true);
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
  await importWallet(
    'edge caught toy sniff enemy upon genre van tunnel make disorder home',
  );
  const accounts = await getAccounts();
  expect(accounts.length).toBe(1);
  expect(isAddress(accounts[0])).toBe(true);
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
  // Hardhat default seed
  await importWallet(
    'test test test test test test test test test test test junk',
  );

  accounts = await getAccounts();
  expect(accounts.length).toBe(9);
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

test('[keychain/index] :: should be able to sign personal messages', async () => {
  const msg = 'Hello World';
  const accounts = await getAccounts();
  const signature = await signMessage({
    address: accounts[0],
    msgData: msg,
  });

  expect(isHexString(signature)).toBe(true);
  const recoveredAddress = verifyMessage(msg, signature);
  expect(getAddress(recoveredAddress)).eq(getAddress(accounts[0]));
});

test('[keychain/index] :: should be able to sign typed data messages ', async () => {
  const msgData = {
    domain: {
      chainId: 1,
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents: 'Hello, Bob!',
      attachedMoneyInEth: 4.2,
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Group: [
        { name: 'name', type: 'string' },
        { name: 'members', type: 'Person[]' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    },
  };

  const accounts = await getAccounts();
  const signature = await signTypedData({
    address: accounts[0],
    msgData,
  });
  expect(isHexString(signature)).toBe(true);

  const recoveredAddress = recoverTypedSignature({
    data: msgData as unknown as TypedMessage<MessageTypes>,
    signature,
    version: SignTypedDataVersion.V4,
  });
  expect(getAddress(recoveredAddress)).eq(getAddress(accounts[0]));
});

test('[keychain/index] :: should be able to send transactions', async () => {
  const accounts = await getAccounts();
  const provider = new StaticJsonRpcProvider('http://127.0.0.1:8545');
  await provider.ready;
  const tx = {
    from: accounts[1],
    to: accounts[2],
    value: parseEther('0.001'),
  };
  const result = await sendTransaction(tx, provider);
  expect(isHexString(result.hash)).toBe(true);
  const txReceipt = await provider.getTransaction(result.hash);
  const receipt = await txReceipt.wait();
  expect(receipt.status).toBe(1);
  expect(receipt.blockNumber).toBeGreaterThan(0);
  expect(receipt.confirmations).toBeGreaterThan(0);
}, 30000);
