import {
  CrosschainQuote,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  SwapType,
  getCrosschainQuote,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';

import {
  ENS_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  TEST_ADDRESS_2,
  USDC_ARBITRUM_ASSET,
  delay,
} from '~/test/utils';

import { ChainId } from '../types/chains';
import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import {
  createUnlockAndCrosschainSwapRap,
  estimateUnlockAndCrosschainSwap,
} from './unlockAndCrosschainSwap';

let swapGasLimit = 0;

let needsUnlockQuote: Quote | QuoteError | null;
let doesntNeedUnlockQuote: Quote | QuoteError | null;

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
  doesntNeedUnlockQuote = await getCrosschainQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    swapType: SwapType.crossChain,
    toChainId: ChainId.arbitrum,
  });
  needsUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ENS_MAINNET_ASSET.address,
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    swapType: SwapType.crossChain,
    toChainId: ChainId.arbitrum,
  });
}, 10000);

test.skip('[rap/unlockAndCrosschainSwap] :: estimate unlock and crosschain swap rap without unlock', async () => {
  const gasLimit = await estimateUnlockAndCrosschainSwap({
    quote: doesntNeedUnlockQuote as CrosschainQuote,
    chainId: 1,
    assetToSell: ETH_MAINNET_ASSET,
    sellAmount: '1000000000000000000',
    assetToBuy: USDC_ARBITRUM_ASSET,
  });
  swapGasLimit = Number(gasLimit);
  expect(swapGasLimit).toBeGreaterThan(0);
});

test.skip('[rap/unlockAndCrosschainSwap] :: estimate unlock and crosschain swap rap with unlock', async () => {
  const gasLimit = await estimateUnlockAndCrosschainSwap({
    quote: needsUnlockQuote as CrosschainQuote,
    chainId: 1,
    assetToSell: ENS_MAINNET_ASSET,
    sellAmount: '1000000000000000000',
    assetToBuy: USDC_ARBITRUM_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
});

test('[rap/unlockAndCrosschainSwap] :: create unlock and crosschain swap rap without unlock', async () => {
  const rap = await createUnlockAndCrosschainSwapRap({
    quote: doesntNeedUnlockQuote as CrosschainQuote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: USDC_ARBITRUM_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndCrosschainSwap] :: create unlock and crosschain swap rap with unlock', async () => {
  const rap = await createUnlockAndCrosschainSwapRap({
    quote: needsUnlockQuote as CrosschainQuote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ENS_MAINNET_ASSET,
    assetToBuy: USDC_ARBITRUM_ASSET,
  });
  expect(rap.actions.length).toBe(2);
});
