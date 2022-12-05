import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  SwapType,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';
import { Address } from 'wagmi';

import { ParsedAsset, UniqueId } from '../types/assets';
import { ChainName } from '../types/chains';
import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import { createUnlockAndSwapRap, estimateUnlockAndSwap } from './unlockAndSwap';

const TEST_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

const ETH_ASSET: ParsedAsset = {
  address: 'eth' as Address,
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#808088' },
  isNativeAsset: true,
  name: 'Ethereum',
  native: {
    price: {
      amount: 1291.8200000000002,
      change: '2.79%',
      display: '$1,291.82',
    },
  },
  price: {
    value: 1291.8200000000002,
    relative_change_24h: 2.7856239208790683,
    changed_at: -1,
  },
  symbol: 'ETH',
  type: 'token',
  uniqueId: 'eth_1' as UniqueId,
  decimals: 18,
};
const USDC_ASSET: ParsedAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#2775CA' },
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'USD Coin',
  native: {
    price: {
      amount: 1.000587633346778,
      change: '-1.34%',
      display: '$1.00',
    },
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
    changed_at: -1,
  },
  symbol: 'USDC',
  type: 'stablecoin',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 6,
};

const ENS_ASSET: ParsedAsset = {
  address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#6E9BF8' },
  isNativeAsset: false,
  name: 'Ethereum Name Service',
  native: {
    price: { change: '0.64%', amount: 13.984137272000002, display: '$13.98' },
  },
  price: {
    changed_at: -1,
    relative_change_24h: 0.6397137281285907,
    value: 13.984137272000002,
  },
  symbol: 'ENS',
  type: 'token',
  uniqueId: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72_1',
  decimals: 18,
};

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let swapGasLimit = 0;

let needsUnlockQuote: Quote | QuoteError | null;
let doesntNeedUnlockQuote: Quote | QuoteError | null;

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
  doesntNeedUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.normal,
    toChainId: 1,
  });
  needsUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS,
    sellTokenAddress: ENS_ASSET.address,
    buyTokenAddress: USDC_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.normal,
    toChainId: 1,
  });
}, 10000);

test('[rap/unlockAndSwap] :: estimate unlock and swap rap without unlock', async () => {
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ETH_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  swapGasLimit = Number(gasLimit);
});

test('[rap/unlockAndSwap] :: estimate unlock and swap rap with unlock', async () => {
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: needsUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ENS_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    tradeDetails: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ETH_ASSET,
    outputCurrency: USDC_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap with unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    tradeDetails: needsUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ENS_ASSET,
    outputCurrency: USDC_ASSET,
  });
  expect(rap.actions.length).toBe(2);
});
