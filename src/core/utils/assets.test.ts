import { expect, test } from 'vitest';
import { Address } from 'wagmi';

import { ZerionAsset } from '../types/assets';
import { ChainId, ChainName } from '../types/chains';
import { SearchAsset } from '../types/search';

import { parseAsset, parseSearchAsset, parseUserAsset } from './assets';

const ETH_FROM_ZERION: ZerionAsset = {
  asset_code: 'eth' as Address,
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  implementations: {
    arbitrum: {
      address: undefined,
      decimals: 18,
    },
    aurora: {
      address: undefined,
      decimals: 18,
    },
    ethereum: {
      address: undefined,
      decimals: 18,
    },
    loopring: {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
    },
    optimism: {
      address: undefined,
      decimals: 18,
    },
  },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  price: {
    value: 1499.87,
    relative_change_24h: -3.4472325578401155,
    changed_at: 0,
  },
  is_displayable: true,
  is_verified: true,
  colors: {
    primary: '#808088',
    fallback: '#E8EAF5',
  },
  network: 'mainnet' as ChainName,
  mainnet_address: 'eth' as Address,
};

const ETH_FROM_SEARCH: SearchAsset = {
  decimals: 18,
  highLiquidity: false,
  name: 'Ethereum',
  symbol: 'ETH',
  uniqueId: 'eth_1',
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  rainbowMetadataId: 76174,
  isRainbowCurated: true,
  isVerified: true,
  networks: {
    '1': { address: 'eth' as Address, decimals: 18 },
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
  address: 'eth' as Address,
  chainId: 1,
  isNativeAsset: true,
  mainnetAddress: 'eth' as Address,
};

const BSC_ETH_FROM_ZERION = {
  asset_code: '0x2170ed0880ac9a755fd29b2688956bd959f933f8' as Address,
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/smartchain/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  name: 'Ethereum',
  network: 'bsc' as ChainName,
  price: {
    value: 1500.67,
    changed_at: 1678390024,
    relative_change_24h: -3.3290651940864646,
  },
  symbol: 'ETH',
  colors: {
    primary: '#808088',
    fallback: '#E8EAF5',
  },
  coingecko_id: 'ethereum',
  mainnet_address: 'eth' as Address,
};

const USD_FROM_ZERION = {
  asset_code: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  implementations: {
    arbitrum: {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      decimals: 6,
    },
    aurora: {
      address: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      decimals: 6,
    },
    avalanche: {
      address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
      decimals: 6,
    },
    'binance-smart-chain': {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      decimals: 18,
    },
    ethereum: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
    fantom: {
      address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      decimals: 6,
    },
    loopring: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
    optimism: {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      decimals: 6,
    },
    polygon: {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
    },
    solana: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
    xdai: {
      address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      decimals: 6,
    },
  },
  type: 'stablecoin',
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  price: {
    value: 1.0034249098613037,
    relative_change_24h: 0.3604239001534948,
    changed_at: -1,
  },
  is_displayable: true,
  is_verified: true,
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
};

const OPTIMISM_USD_FROM_SEARCH: SearchAsset = {
  decimals: 6,
  highLiquidity: true,
  name: 'USD Coin',
  symbol: 'USDC',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_10',
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  rainbowMetadataId: 1746,
  isRainbowCurated: true,
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
};

const OPTIMISM_USD_FROM_ZERION = {
  asset_code: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
  decimals: 6,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  name: 'USD Coin',
  network: 'optimism',
  price: {
    value: 1.001,
    changed_at: 1678390027,
    relative_change_24h: 0.06633900739942358,
  },
  symbol: 'USDC',
  colors: {
    primary: '#2775CA',
    fallback: '#9ABDE8',
  },
  coingecko_id: 'usd-coin',
  mainnet_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
};

test('[utils/assets -> parseAsset] :: parse zerion asset', async () => {
  const eth = parseAsset({
    asset: ETH_FROM_ZERION as ZerionAsset,
    currency: 'USD',
  });
  expect(eth.uniqueId).toEqual('eth_1');
  expect(eth.isNativeAsset).toEqual(true);

  const bscEth = parseAsset({
    asset: BSC_ETH_FROM_ZERION as ZerionAsset,
    currency: 'EUR',
  });
  expect(bscEth.uniqueId).toEqual('eth_56');
  expect(bscEth.isNativeAsset).toEqual(false);
  expect(bscEth.native.price?.display[0]).toEqual('€');

  const usd = parseAsset({
    asset: USD_FROM_ZERION as ZerionAsset,
    currency: 'USD',
  });
  expect(usd.uniqueId).toEqual(
    `${USD_FROM_ZERION.asset_code}_${ChainId.mainnet}`,
  );
  expect(usd.isNativeAsset).toEqual(false);

  const optimismUSD = parseAsset({
    asset: OPTIMISM_USD_FROM_ZERION as ZerionAsset,
    currency: 'USD',
  });
  expect(optimismUSD.uniqueId).toEqual(
    `${OPTIMISM_USD_FROM_ZERION.mainnet_address}_${ChainId.optimism}`,
  );
  expect(optimismUSD.isNativeAsset).toEqual(false);
  expect(optimismUSD.native.price?.display[0]).toEqual('$');
});

test('[utils/assets -> parseUserAsset] :: parse zerion asset with user balance', async () => {
  const eth = parseAsset({
    asset: ETH_FROM_ZERION as ZerionAsset,
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
    asset: OPTIMISM_USD_FROM_ZERION as ZerionAsset,
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
    asset: ETH_FROM_ZERION as ZerionAsset,
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

  expect(eth.address).toEqual(ethFromSearchData.address);
  expect(eth.address).toEqual(ethFromSearchDataWithPrice.address);
  expect(eth.address).toEqual(ethFromSearchDataWithQuantity.address);

  expect(eth.mainnetAddress).toEqual(ethFromSearchData.mainnetAddress);
  expect(eth.mainnetAddress).toEqual(ethFromSearchDataWithPrice.mainnetAddress);
  expect(eth.mainnetAddress).toEqual(
    ethFromSearchDataWithQuantity.mainnetAddress,
  );

  expect(eth.uniqueId).toEqual(ethFromSearchData.uniqueId);
  expect(eth.uniqueId).toEqual(ethFromSearchDataWithPrice.uniqueId);
  expect(eth.uniqueId).toEqual(ethFromSearchDataWithQuantity.uniqueId);

  expect(ethFromSearchData.isNativeAsset).toBe(true);
  expect(ethFromSearchDataWithPrice.isNativeAsset).toBe(true);
  expect(ethFromSearchDataWithQuantity.isNativeAsset).toBe(true);

  const optimismUSD = parseAsset({
    asset: OPTIMISM_USD_FROM_ZERION as ZerionAsset,
    currency: 'USD',
  });
  const optimismUSDWithQuantity = parseUserAsset({
    asset: OPTIMISM_USD_FROM_ZERION as ZerionAsset,
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

  expect(optimismUSD.address).toEqual(optimismUSDFromSearch.address);
  expect(optimismUSD.address).toEqual(optimismUSDFromSearchWithPrice.address);
  expect(optimismUSD.address).toEqual(
    optimismUSDFromSearchWithQuantity.address,
  );

  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearch.mainnetAddress,
  );
  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearchWithPrice.mainnetAddress,
  );
  expect(optimismUSD.mainnetAddress).toEqual(
    optimismUSDFromSearchWithQuantity.mainnetAddress,
  );

  expect(optimismUSD.uniqueId).toEqual(optimismUSDFromSearch.uniqueId);
  expect(optimismUSD.uniqueId).toEqual(optimismUSDFromSearchWithPrice.uniqueId);
  expect(optimismUSD.uniqueId).toEqual(
    optimismUSDFromSearchWithQuantity.uniqueId,
  );

  expect(optimismUSDFromSearch.isNativeAsset).toBe(false);
  expect(optimismUSDFromSearchWithPrice.isNativeAsset).toBe(false);
  expect(optimismUSDFromSearchWithQuantity.isNativeAsset).toBe(false);
});
