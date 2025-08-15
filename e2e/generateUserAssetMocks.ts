import fs from 'fs';
import path from 'path';

import { Hex, sha256 } from 'viem';

import { ChainId, ChainName } from '../src/core/types/chains';
import { AddressAssetsReceivedMessage } from '../src/core/types/zerion';

import { TEST_VARIABLES } from './walletVariables';

// Base URL for addys API
const ADDYS_BASE_URL = 'https://addys.p.rainbow.me/v3';

// Test wallet addresses to generate mocks for
const TEST_WALLETS = [
  TEST_VARIABLES.SEED_WALLET.ADDRESS,
  TEST_VARIABLES.SWAPS_WALLET.ADDRESS,
  TEST_VARIABLES.EMPTY_WALLET.ADDRESS,
  TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS,
  TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS,
  TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS,
  TEST_VARIABLES.SEED_PHRASE_24.ADDRESS,
];

// The exact list of chain IDs requested by the application
const REQUESTED_CHAIN_IDS = [
  1, 10, 56, 100, 130, 137, 324, 1625, 1996, 8453, 33139, 42161, 43114, 57073,
  59144, 80094, 81457, 534352, 7777777, 666666666,
];

// CI seems to use a different chain list (missing: 100, 324, 59144, 534352)
const CI_CHAIN_IDS = [
  1, 10, 56, 130, 137, 1625, 1996, 8453, 33139, 42161, 43114, 57073, 80094,
  81457, 7777777, 666666666,
];

// Generate mock response for a wallet address
function generateMockResponse(
  address: string,
  chainIds: number[],
  currency: string,
): AddressAssetsReceivedMessage {
  // Generate different balances based on wallet
  const isEmptyWallet = address === TEST_VARIABLES.EMPTY_WALLET.ADDRESS;

  const ethBalance = isEmptyWallet ? '0' : '10000000000000000000000'; // 10,000 ETH
  const usdcBalance = isEmptyWallet ? '0' : '50000000000'; // 50,000 USDC
  const daiBalance = isEmptyWallet ? '0' : '100000000000000000000000'; // 100,000 DAI
  const opBalance = isEmptyWallet ? '0' : '10000000000000000000000'; // 10,000 OP ETH

  const response: AddressAssetsReceivedMessage = {
    payload: {
      assets: [],
    },
    meta: {
      chain_ids: chainIds,
      chain_ids_with_errors: [],
      currency: currency.toLowerCase(),
      status: 'ok',
    },
  };

  // Add mainnet assets if requested
  if (chainIds.includes(ChainId.mainnet)) {
    response.payload!.assets!.push(
      {
        asset: {
          asset_code: 'eth',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          chain_id: ChainId.mainnet,
          price: {
            value: 3000,
            changed_at: Date.now() / 1000,
            relative_change_24h: 2.5,
          },
          icon_url:
            'https://rainbowme-res.cloudinary.com/image/upload/v1668633477/assets/ethereum/eth.png',
          colors: {
            primary: '#627EEA',
            fallback: '#627EEA',
          },
          network: ChainName.mainnet,
          networks: {
            [ChainId.mainnet]: {
              address: 'eth',
              decimals: 18,
            },
          },
          bridging: {
            bridgeable: true,
            networks: {},
          },
        },
        quantity: ethBalance,
      },
      {
        asset: {
          asset_code: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          chain_id: ChainId.mainnet,
          price: {
            value: 1,
            changed_at: Date.now() / 1000,
            relative_change_24h: 0.1,
          },
          icon_url:
            'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
          network: ChainName.mainnet,
          networks: {
            [ChainId.mainnet]: {
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              decimals: 6,
            },
          },
          bridging: {
            bridgeable: true,
            networks: {},
          },
        },
        quantity: usdcBalance,
      },
      {
        asset: {
          asset_code: '0x6b175474e89094c44da98b954eedeac495271d0f',
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          decimals: 18,
          chain_id: ChainId.mainnet,
          price: {
            value: 1,
            changed_at: Date.now() / 1000,
            relative_change_24h: 0.05,
          },
          icon_url:
            'https://rainbowme-res.cloudinary.com/image/upload/v1668633477/assets/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png',
          network: ChainName.mainnet,
          networks: {
            [ChainId.mainnet]: {
              address: '0x6b175474e89094c44da98b954eedeac495271d0f',
              decimals: 18,
            },
          },
          bridging: {
            bridgeable: true,
            networks: {},
          },
        },
        quantity: daiBalance,
      },
    );
  }

  // Add Optimism assets if requested
  if (chainIds.includes(ChainId.optimism)) {
    response.payload!.assets!.push({
      asset: {
        asset_code: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        chain_id: ChainId.optimism,
        price: {
          value: 3000,
          changed_at: Date.now() / 1000,
          relative_change_24h: 2.5,
        },
        icon_url:
          'https://rainbowme-res.cloudinary.com/image/upload/v1668633477/assets/ethereum/eth.png',
        colors: {
          primary: '#627EEA',
          fallback: '#627EEA',
        },
        network: ChainName.optimism,
        networks: {
          [ChainId.optimism]: {
            address: 'eth',
            decimals: 18,
          },
        },
        bridging: {
          bridgeable: true,
          networks: {},
        },
      },
      quantity: opBalance,
    });
  }

  return response;
}

// Generate and save mock files
function generateMocks() {
  const generatedMocks: string[] = [];

  // Ensure mock directories exist
  const mocksDir = path.join(__dirname, 'mocks');
  const userAssetsDir = path.join(mocksDir, 'user_assets');

  if (!fs.existsSync(mocksDir)) {
    fs.mkdirSync(mocksDir);
  }
  if (!fs.existsSync(userAssetsDir)) {
    fs.mkdirSync(userAssetsDir);
  }

  // Generate mocks for both chain lists
  const chainLists = [
    { name: 'Original', chains: REQUESTED_CHAIN_IDS },
    { name: 'CI', chains: CI_CHAIN_IDS },
  ];

  for (const { name, chains } of chainLists) {
    console.log(`\nGenerating mocks for ${name} chain list...`);

    // Generate mock for the "no address" case (happens when wallet not yet loaded)
    for (const currency of ['usd']) {
      const noAddressUrl = `${ADDYS_BASE_URL}/${chains.join(
        ',',
      )}//assets/?currency=${currency}`;
      const hash = sha256(noAddressUrl as Hex);

      // Generate empty response for no address
      const emptyResponse: AddressAssetsReceivedMessage = {
        payload: { assets: [] },
        meta: {
          chain_ids: chains,
          currency: currency,
          address: '',
          chain_ids_with_errors: [],
          status: 'ok',
        },
      };

      const mockPath = path.join(
        __dirname,
        'mocks',
        'user_assets',
        `${hash}.json`,
      );
      fs.writeFileSync(mockPath, JSON.stringify(emptyResponse, null, 2));
      generatedMocks.push(`${hash} -> ${noAddressUrl} (no address)`);
    }

    for (const address of TEST_WALLETS) {
      for (const currency of ['usd']) {
        // Construct the URL with the exact chain list
        const url = `${ADDYS_BASE_URL}/${chains.join(
          ',',
        )}/${address.toLowerCase()}/assets/?currency=${currency}`;

        // Generate hash for the URL
        const hash = sha256(url as Hex);

        // Generate mock response
        const mockResponse = generateMockResponse(address, chains, currency);

        // Save mock to file
        const mockPath = path.join(
          __dirname,
          'mocks',
          'user_assets',
          `${hash}.json`,
        );
        fs.writeFileSync(mockPath, JSON.stringify(mockResponse, null, 2));

        generatedMocks.push(`${hash} -> ${url}`);
      }
    }
  }

  console.log('Generated mock files for requested chains:');
  generatedMocks.forEach((mock) => console.log(mock));
}

// Run if executed directly
if (process.argv[1] === __filename) {
  generateMocks();
  console.log('Mock generation complete!');
}
