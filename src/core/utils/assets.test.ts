import { AddressZero } from '@ethersproject/constants';
import { expect, test } from 'vitest';

import { ETH_ADDRESS } from '../references';
import { AddressOrEth, AssetApiResponse, AssetMetadata } from '../types/assets';
import { ChainId, ChainName } from '../types/chains';
import { SearchAsset } from '../types/search';

import {
  parseAsset,
  parseAssetMetadata,
  parseSearchAsset,
  parseUserAsset,
} from './assets';

const ETH_FROM_ZERION = {
  asset_code: 'eth',
  chain_id: ChainId.mainnet,
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  price: {
    value: 1499.87,
    relative_change_24h: -3.4472325578401155,
    changed_at: 1678390027,
  },
  networks: {
    [ChainId.arbitrum]: {
      address: AddressZero,
      decimals: 18,
    },
    [ChainId.mainnet]: {
      address: ETH_ADDRESS,
      decimals: 18,
    },
    [ChainId.optimism]: {
      address: AddressZero,
      decimals: 18,
    },
  },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  colors: {
    primary: '#808088',
    fallback: '#E8EAF5',
  },
  network: ChainName.mainnet,
  bridging: {
    bridgeable: true,
    networks: [],
  },
} satisfies AssetApiResponse;

const ETH_FROM_SEARCH: SearchAsset = {
  decimals: 18,
  highLiquidity: false,
  name: 'Ethereum',
  symbol: 'ETH',
  uniqueId: 'eth_1',
  isRainbowCurated: false,
  isPopular: false,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  rainbowMetadataId: 76174,
  isVerified: true,
  networks: {
    '1': { address: 'eth', decimals: 18 },
    '10': {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    '56': {
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      decimals: 18,
    },
    '42161': {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
  },
  address: 'eth',
  chainId: 1,
  isNativeAsset: true,
  mainnetAddress: 'eth',
};

const ETH_FROM_METADATA = {
  colors: {
    primary: '#808088',
    fallback: '#E8EAF5',
    shadow: '',
  },
  circulatingSupply: 120217770.055426,
  decimals: 18,
  description:
    'Ethereum is a global, open-source platform for decentralized applications. In other words, the vision is to create a world computer that anyone can build applications in a decentralized manner; while all states and data are distributed and publicly accessible. Ethereum supports smart contracts in which developers can write code in order to program digital value. Examples of decentralized apps (dapps) that are built on Ethereum includes tokens, non-fungible tokens, decentralized finance apps, lending protocol, decentralized exchanges, and much more.\r\n\r\nOn Ethereum, all transactions and smart contract executions require a small fee to be paid. This fee is called Gas. In technical terms, Gas refers to the unit of measure on the amount of computational effort required to execute an operation or a smart contract. The more complex the execution operation is, the more gas is required to fulfill that operation. Gas fees are paid entirely in Ether (ETH), which is the native coin of the blockchain. The price of gas can fluctuate from time to time depending on the network demand.',
  fullyDilutedValuation: 197741115082,
  iconUrl:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/ethereum/eth.png',
  marketCap: 197741115082,
  name: 'Ethereum',
  networks: {
    1: {
      address: 'eth',
      decimals: 18,
    },
    10: {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    56: {
      address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
      decimals: 18,
    },
    8453: {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    42161: {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    7777777: {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
  },
  price: {
    // changedAt: 1678390027,
    relativeChange24h: -0.6368079848712814,
    value: 1644.5900000000001,
  },
  symbol: 'ETH',
  totalSupply: 120217770.055426,
  volume1d: 4573101281,
} satisfies AssetMetadata;

const BSC_ETH_FROM_ZERION = {
  asset_code: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
  chain_id: ChainId.bsc,
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  name: 'Ethereum',
  network: 'bsc' as ChainName,
  symbol: 'ETH',
  colors: {
    primary: '#808088',
    fallback: '#E8EAF5',
  },
  bridging: {
    bridgeable: true,
    networks: [],
  },
  price: {
    value: 1500.67,
    relative_change_24h: -3.3290651940864646,
    changed_at: 1678390027,
  },
} satisfies AssetApiResponse;

const USD_FROM_ZERION = {
  asset_code: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chain_id: ChainId.mainnet,
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  networks: {
    '1': {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
    '10': {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
    },
    '56': {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
    },
    '137': {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
    },
    '42161': {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      decimals: 6,
    },
    '43114': {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      decimals: 6,
    },
  },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
  bridging: {
    bridgeable: true,
    networks: [],
  },
  price: {
    value: 1.0034249098613037,
    relative_change_24h: 0.3604239001534948,
    changed_at: 1678390027,
  },
} satisfies AssetApiResponse;

const OPTIMISM_USD_FROM_SEARCH = {
  decimals: 6,
  highLiquidity: true,
  name: 'USD Coin',
  symbol: 'USDC',
  isRainbowCurated: false,
  isPopular: false,
  uniqueId: '0x7f5c764cbc14f9669b88837ca1490cca17c31607_10',
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  rainbowMetadataId: 1746,
  isVerified: true,
  networks: {
    '1': {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
    '10': {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
    },
    '56': {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
    },
    '137': {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
    },
    '42161': {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      decimals: 6,
    },
    '43114': {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      decimals: 6,
    },
  },
  address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
  chainId: 10,
  isNativeAsset: false,
  mainnetAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
} satisfies SearchAsset;

const OPTIMISM_USD_FROM_ZERION = {
  asset_code: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
  chain_id: ChainId.optimism,
  decimals: 6,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  name: 'USD Coin',
  network: ChainName.optimism,
  symbol: 'USDC',
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
  bridging: {
    bridgeable: true,
    networks: [],
  },
  networks: {
    '1': {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
    '10': {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
    },
    '56': {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
    },
    '137': {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
    },
    '42161': {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      decimals: 6,
    },
    '43114': {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      decimals: 6,
    },
  },
  price: {
    value: 1.001,
    relative_change_24h: 0.06633900739942358,
    changed_at: 1678390027,
  },
} satisfies AssetApiResponse;

const OPTIMISM_USD_FROM_METADATA = {
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
    shadow: '',
  },
  circulatingSupply: 26028772605.095,
  decimals: 6,
  description:
    'USDC is a fully collateralized US dollar stablecoin. USDC is the bridge between dollars and trading on cryptocurrency exchanges. The technology behind CENTRE makes it possible to exchange value between people, businesses and financial institutions just like email between mail services and texts between SMS providers. We believe by removing artificial economic borders, we can create a more inclusive global economy.',
  fullyDilutedValuation: 26031924825,
  iconUrl:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  marketCap: 26035198350,
  name: 'USD Coin',
  networks: {
    1: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as AddressOrEth,
      decimals: 6,
    },
    10: {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607' as AddressOrEth,
      decimals: 6,
    },
    56: {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' as AddressOrEth,
      decimals: 18,
    },
    137: {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' as AddressOrEth,
      decimals: 6,
    },
    8453: {
      address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca' as AddressOrEth,
      decimals: 6,
    },
    42161: {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8' as AddressOrEth,
      decimals: 6,
    },
    43114: {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664' as AddressOrEth,
      decimals: 6,
    },
  },
  price: {
    value: 0.9995689476626687,
    relativeChange24h: -0.0237896016422826,
  },
  symbol: 'USDC',
  totalSupply: 26025499887.9661,
  volume1d: 2279756294,
};

test('[utils/assets -> parseAsset] :: parse zerion asset', async () => {
  const eth = parseAsset({
    asset: ETH_FROM_ZERION,
    currency: 'USD',
  });
  expect(eth.uniqueId).toEqual('eth_1');
  expect(eth.isNativeAsset).toEqual(true);

  const bscEth = parseAsset({
    asset: BSC_ETH_FROM_ZERION,
    currency: 'EUR',
  });
  expect(bscEth.uniqueId).toEqual(
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8_56',
  );
  expect(bscEth.isNativeAsset).toEqual(false);
  expect(bscEth.native.price?.display[0]).toEqual('€');

  const usd = parseAsset({
    asset: USD_FROM_ZERION,
    currency: 'USD',
  });
  expect(usd.uniqueId).toEqual(
    `${USD_FROM_ZERION.asset_code}_${ChainId.mainnet}`,
  );
  expect(usd.isNativeAsset).toEqual(false);

  const optimismUSD = parseAsset({
    asset: OPTIMISM_USD_FROM_ZERION,
    currency: 'USD',
  });
  expect(optimismUSD.uniqueId).toEqual(
    `${OPTIMISM_USD_FROM_ZERION.asset_code}_${ChainId.optimism}`,
  );
  expect(optimismUSD.isNativeAsset).toEqual(false);
  expect(optimismUSD.native.price?.display[0]).toEqual('$');
});

test('[utils/assets -> parseUserAsset] :: parse zerion asset with user balance', async () => {
  const eth = parseAsset({
    asset: ETH_FROM_ZERION,
    currency: 'USD',
  });
  const ethWithQuantity = parseUserAsset({
    asset: ETH_FROM_ZERION,
    currency: 'USD',
    balance: '38677330754953265',
  });
  expect(eth.uniqueId).toEqual(ethWithQuantity.uniqueId);
  expect(ethWithQuantity.native.balance.amount).toEqual(
    '58.01096807943175357555',
  );
  expect(ethWithQuantity.native.balance.display).toEqual('$58.01');

  const optimismUSDWithQuantity = parseUserAsset({
    asset: OPTIMISM_USD_FROM_ZERION,
    currency: 'JPY',
    balance: '423170978092067929',
  });
  expect(optimismUSDWithQuantity.native.balance.amount).toEqual(
    '423594149070.159996929',
  );
  expect(optimismUSDWithQuantity.native.balance.display).toEqual(
    '¥423,594,149,070.16',
  );
});
test('[utils/assets -> parseSearchAsset] :: combine search asset data with optional price socket info and optional address socket info', async () => {
  const eth = parseAsset({
    asset: ETH_FROM_ZERION,
    currency: 'USD',
  });
  const ethWithQuantity = parseUserAsset({
    asset: ETH_FROM_ZERION,
    currency: 'USD',
    balance: '38677330754953265',
  });
  const ethFromSearchData = parseSearchAsset({
    searchAsset: ETH_FROM_SEARCH,
  });
  const ethFromSearchDataWithPrice = parseSearchAsset({
    searchAsset: ETH_FROM_SEARCH,
    assetWithPrice: eth,
  });
  const ethFromSearchDataWithQuantity = parseSearchAsset({
    searchAsset: ETH_FROM_SEARCH,
    userAsset: ethWithQuantity,
  });
  const ethFromMetadata = parseAssetMetadata({
    address: 'eth',
    asset: ETH_FROM_METADATA,
    chainId: 1,
    currency: 'USD',
  });

  expect(eth.address).toEqual(ethFromSearchData.address);
  expect(eth.address).toEqual(ethFromSearchDataWithPrice.address);
  expect(eth.address).toEqual(ethFromSearchDataWithQuantity.address);
  expect(eth.address).toEqual(ethFromMetadata.address);

  expect(eth.mainnetAddress).toEqual(ethFromSearchData.mainnetAddress);
  expect(eth.mainnetAddress).toEqual(ethFromSearchDataWithPrice.mainnetAddress);
  expect(eth.mainnetAddress).toEqual(
    ethFromSearchDataWithQuantity.mainnetAddress,
  );
  expect(eth.mainnetAddress).toEqual(ethFromMetadata.mainnetAddress);

  expect(eth.uniqueId).toEqual(ethFromSearchData.uniqueId);
  expect(eth.uniqueId).toEqual(ethFromSearchDataWithPrice.uniqueId);
  expect(eth.uniqueId).toEqual(ethFromSearchDataWithQuantity.uniqueId);
  expect(eth.uniqueId).toEqual(ethFromMetadata.uniqueId);

  expect(ethFromSearchData.isNativeAsset).toBe(true);
  expect(ethFromSearchDataWithPrice.isNativeAsset).toBe(true);
  expect(ethFromSearchDataWithQuantity.isNativeAsset).toBe(true);
  expect(ethFromMetadata.isNativeAsset).toBe(true);

  const optimismUSD = parseAsset({
    asset: OPTIMISM_USD_FROM_ZERION,
    currency: 'USD',
  });
  const optimismUSDWithQuantity = parseUserAsset({
    asset: OPTIMISM_USD_FROM_ZERION,
    currency: 'USD',
    balance: '38677330754953265',
  });
  const optimismUSDFromSearch = parseSearchAsset({
    searchAsset: OPTIMISM_USD_FROM_SEARCH,
  });
  const optimismUSDFromSearchWithPrice = parseSearchAsset({
    searchAsset: OPTIMISM_USD_FROM_SEARCH,
    assetWithPrice: optimismUSD,
  });
  const optimismUSDFromSearchWithQuantity = parseSearchAsset({
    searchAsset: OPTIMISM_USD_FROM_SEARCH,
    userAsset: optimismUSDWithQuantity,
  });
  const optimismUSDFromMetadata = parseAssetMetadata({
    address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    asset: OPTIMISM_USD_FROM_METADATA,
    chainId: 10,
    currency: 'USD',
  });

  expect(optimismUSD.address).toEqual(optimismUSDFromSearch.address);
  expect(optimismUSD.address).toEqual(optimismUSDFromSearchWithPrice.address);
  expect(optimismUSD.address).toEqual(
    optimismUSDFromSearchWithQuantity.address,
  );
  expect(optimismUSD.address).toEqual(optimismUSDFromMetadata.address);

  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearch.mainnetAddress,
  );
  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearchWithPrice.mainnetAddress,
  );
  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearchWithQuantity.mainnetAddress,
  );
  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromMetadata.mainnetAddress,
  );

  expect(optimismUSD.uniqueId).toEqual(optimismUSDFromSearch.uniqueId);
  expect(optimismUSD.uniqueId).toEqual(optimismUSDFromSearchWithPrice.uniqueId);
  expect(optimismUSD.uniqueId).toEqual(
    optimismUSDFromSearchWithQuantity.uniqueId,
  );
  expect(optimismUSD.uniqueId).toEqual(optimismUSDFromMetadata.uniqueId);

  expect(optimismUSDFromSearch.isNativeAsset).toBe(false);
  expect(optimismUSDFromSearchWithPrice.isNativeAsset).toBe(false);
  expect(optimismUSDFromSearchWithQuantity.isNativeAsset).toBe(false);
  expect(optimismUSDFromMetadata.isNativeAsset).toBe(false);
});
