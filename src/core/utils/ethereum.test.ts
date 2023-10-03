import { expect, test } from 'vitest';

import { sanitizeTypedData } from './ethereum';

const complexMessage = {
  domain: {
    chainId: '1337',
    name: 'Ether Mail',
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    version: '1',
  },
  message: {
    contents: 'Hello, Bob!',
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
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
    ],
    Group: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'members',
        type: 'Person[]',
      },
    ],
    Mail: [
      {
        name: 'from',
        type: 'Person',
      },
      {
        name: 'to',
        type: 'Person[]',
      },
      {
        name: 'contents',
        type: 'string',
      },
    ],
    Person: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'wallets',
        type: 'address[]',
      },
    ],
  },
};

const complexMessageBad = {
  ...complexMessage,
  message: {
    ...complexMessage.message,
    thisIsBad: 'yeah',
  },
};

const phishingMessage = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Permit: [
      { name: 'holder', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'allowed', type: 'bool' },
      { name: 'expiry', type: 'uint256' },
    ],
  },
  primaryType: 'Permit',
  domain: {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: 1, // Ethereum mainnet
    verifyingContract: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  message: {
    'TX simulation':
      'NO RISK FOUND ✅ ⸻⸻⸻⸻⸻⸻⁢ ⁢ ⁢ ⁢ ⁢ ⁢ ⁢ 100 DAI will be transferred to your account',
    holder: '0x000000000000000000000000deadbeef',
    spender: '0x00000000000000000000000000deface',
    nonce: 1,
    allowed: true,
    expiry: 12345678,
  },
};

test('[utils/ethereum -> sanitizeTypeData] :: valid message should stay identical', async () => {
  const sanitizedMessage = sanitizeTypedData(complexMessage);
  expect(sanitizedMessage).toEqual(complexMessage);
});

test('[utils/ethereum -> sanitizeTypeData] :: bad message should not contain extra types', async () => {
  const sanitizedMessage = sanitizeTypedData(complexMessageBad);
  expect(sanitizedMessage).toEqual(complexMessage);
});

test('[utils/ethereum -> sanitizeTypeData] :: extra fields for phishing attempt should be ignored', async () => {
  const sanitizedMessage = sanitizeTypedData(phishingMessage);
  expect(sanitizedMessage.message['TX simulation']).toBe(undefined);
});
