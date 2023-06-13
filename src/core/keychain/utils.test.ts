import { expect, test } from 'vitest';

import { autoDiscoverAccounts, autoDiscoverAccountsFromIndex } from './utils';

const ACCOUNTS = [
  '0x01',
  '0x02',
  '0x03',
  '0x04',
  '0x05',
  '0x06',
  '0x07',
  '0x08',
  '0x09',
  '0x0a',
  '0x0b',
  '0x0c',
  '0x0d',
  '0x0e',
  '0x0f',
  '0x10',
  '0x11',
  '0x12',
  '0x13',
  '0x14',
  '0x15',
  '0x16',
  '0x17',
  '0x18',
  '0x19',
  '0x1a',
  '0x1b',
  '0x1c',
  '0x1d',
  '0x1e',
];

const ACCOUNTS_2 = [
  '0x101',
  '0x102',
  '0x103',
  '0x104',
  '0x105',
  '0x106',
  '0x107',
  '0x108',
  '0x109',
  '0x10a',
];

test('[keychain/utils] :: should be able to autodiscover accounts from index', async () => {
  const discoveredAccounts1 = await autoDiscoverAccountsFromIndex({
    initialIndex: 0,
    deriveWallet: (i) => ({ address: ACCOUNTS[i] }),
  });
  expect(discoveredAccounts1.accountsEnabled).toBe(10);
  const discoveredAccounts2 = await autoDiscoverAccountsFromIndex({
    initialIndex: 10,
    deriveWallet: (i) => ({ address: ACCOUNTS[i] }),
  });
  expect(discoveredAccounts2.accountsEnabled).toBe(10);
  const discoveredAccounts3 = await autoDiscoverAccountsFromIndex({
    initialIndex: 20,
    deriveWallet: (i) => ({ address: ACCOUNTS[i] }),
  });
  expect(discoveredAccounts3.accountsEnabled).toBe(2);
});

test('[keychain/utils] :: should be able to autodiscover accounts', async () => {
  const { accountsEnabled } = await autoDiscoverAccounts({
    deriveWallet: (i) => ({ address: ACCOUNTS[i] }),
  });
  expect(accountsEnabled).toBe(22);
});

test('[keychain/utils] :: should be able to autodiscover accounts when none have activity', async () => {
  const { accountsEnabled } = await autoDiscoverAccounts({
    deriveWallet: (i) => ({ address: ACCOUNTS_2[i] }),
  });
  expect(accountsEnabled).toBe(1);
});
