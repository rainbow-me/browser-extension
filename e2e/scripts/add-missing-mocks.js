#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Add missing mock responses to recordings
 * This fixes CI by ensuring critical API responses are available
 */

const fs = require('fs');
const path = require('path');

const recordingsPath = path.join(
  __dirname,
  '../fixtures/swap-flow-1/recordings.json',
);

// Load existing recordings
let recordings = [];
if (fs.existsSync(recordingsPath)) {
  recordings = JSON.parse(fs.readFileSync(recordingsPath, 'utf-8'));
}

// Mock response for addys.p.rainbow.me assets endpoint
const assetsMock = {
  meta: {
    addresses: [],
    currency: 'usd',
    chain_ids: [1],
    status: 'ok',
  },
  payload: {
    assets: [
      {
        asset: {
          asset_code: 'eth',
          decimals: 18,
          icon_url:
            'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/eth.png',
          name: 'Ethereum',
          network: 'mainnet',
          chain_id: 1,
          price: { value: 2629.45, changed_at: Date.now() },
          symbol: 'ETH',
          type: 'native',
        },
        quantity: '1000000000000000000',
        native: {
          balance: { amount: '1000000000000000000', display: '1 ETH' },
          price: { amount: '2629.45', display: '$2,629.45' },
        },
      },
    ],
  },
};

// Add recordings for various chain combinations CI might use
const chainVariations = [
  '1,10,56,100,130,137,324,1625,1996,8453,33139,42161,43114,57073,59144,80094,81457,534352,7777777,666666666',
  '1,10,56,130,137,1625,1996,8453,33139,42161,43114,57073,80094,81457,7777777,666666666',
  '1,10,56,130,137,1625,1996,8453,33139,42161,43114,57073,80094,81457,534352,7777777,666666666',
];

const walletAddress = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720';

chainVariations.forEach((chains, index) => {
  // Add for general assets call
  recordings.push({
    id: `addys-assets-${index}`,
    timestamp: Date.now(),
    request: {
      method: 'GET',
      url: `https://addys.p.rainbow.me/v3/${chains}//assets/?currency=usd`,
      headers: {},
      body: '',
    },
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(assetsMock),
    },
  });

  // Add without double slash
  recordings.push({
    id: `addys-assets-clean-${index}`,
    timestamp: Date.now(),
    request: {
      method: 'GET',
      url: `https://addys.p.rainbow.me/v3/${chains}/assets?currency=usd`,
      headers: {},
      body: '',
    },
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(assetsMock),
    },
  });

  // Add for wallet-specific assets
  recordings.push({
    id: `addys-wallet-assets-${index}`,
    timestamp: Date.now(),
    request: {
      method: 'GET',
      url: `https://addys.p.rainbow.me/v3/${chains}/${walletAddress}/assets/?currency=usd`,
      headers: {},
      body: '',
    },
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(assetsMock),
    },
  });

  // Without trailing slash
  recordings.push({
    id: `addys-wallet-assets-clean-${index}`,
    timestamp: Date.now(),
    request: {
      method: 'GET',
      url: `https://addys.p.rainbow.me/v3/${chains}/${walletAddress}/assets?currency=usd`,
      headers: {},
      body: '',
    },
    response: {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(assetsMock),
    },
  });
});

// Save updated recordings
fs.writeFileSync(recordingsPath, JSON.stringify(recordings, null, 2));

console.log(`✅ Added ${chainVariations.length * 4} asset mock responses`);
console.log(`📁 Updated: ${recordingsPath}`);
console.log(`\nAdded mocks for:`);
console.log('- General assets endpoint (with and without trailing slash)');
console.log('- Wallet-specific assets endpoint');
console.log('- Multiple chain ID combinations');
