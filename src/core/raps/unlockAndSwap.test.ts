import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  SwapType,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';

import {
  ENS_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  TEST_ADDRESS_2,
  USDC_MAINNET_ASSET,
  delay,
} from '~/test/utils';

import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import { createUnlockAndSwapRap, estimateUnlockAndSwap } from './unlockAndSwap';

let swapGasLimit = 0;

let needsUnlockQuote: Quote | QuoteError | null;
let doesntNeedUnlockQuote: Quote | QuoteError | null;

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
  doesntNeedUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    swapType: SwapType.normal,
    toChainId: 1,
  });
  needsUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ENS_MAINNET_ASSET.address,
    buyTokenAddress: USDC_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    swapType: SwapType.normal,
    toChainId: 1,
  });
}, 10000);

test('[rap/unlockAndSwap] :: estimate unlock and swap rap without unlock', async () => {
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ETH_MAINNET_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_MAINNET_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  swapGasLimit = Number(gasLimit);
});

test('[rap/unlockAndSwap] :: estimate unlock and swap rap with unlock', async () => {
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: needsUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ENS_MAINNET_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_MAINNET_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    tradeDetails: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ETH_MAINNET_ASSET,
    outputCurrency: USDC_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap with unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    tradeDetails: needsUnlockQuote as Quote,
    chainId: 1,
    inputCurrency: ENS_MAINNET_ASSET,
    outputCurrency: USDC_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(2);
});
