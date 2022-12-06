import {
  CrosschainQuote,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  SwapType,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';
import { Address } from 'wagmi';

import { ParsedAsset, UniqueId } from '../types/assets';
import { ChainId, ChainName } from '../types/chains';
import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import {
  createUnlockAndCrosschainSwapRap,
  estimateUnlockAndCrosschainSwap,
} from './unlockAndCrosschainSwap';
import { ENS_MAINNET_ASSET, ETH_MAINNET_ASSET } from './unlockAndSwap.test';

const TEST_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

const USDC_ARBITRUM_ASSET: ParsedAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  chainId: ChainId.arbitrum,
  chainName: ChainName.arbitrum,
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
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.crossChain,
    toChainId: ChainId.arbitrum,
  });
  needsUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS,
    sellTokenAddress: ENS_MAINNET_ASSET.address,
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.crossChain,
    toChainId: ChainId.arbitrum,
  });
}, 10000);

test('[rap/unlockAndCrosschainSwap] :: estimate unlock and swap rap without unlock', async () => {
  const gasLimit = await estimateUnlockAndCrosschainSwap({
    tradeDetails: doesntNeedUnlockQuote as CrosschainQuote,
    chainId: 1,
    inputCurrency: ETH_MAINNET_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ARBITRUM_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  swapGasLimit = Number(gasLimit);
});

test('[rap/unlockAndCrosschainSwap] :: estimate unlock and swap rap with unlock', async () => {
  const gasLimit = await estimateUnlockAndCrosschainSwap({
    tradeDetails: needsUnlockQuote as CrosschainQuote,
    chainId: 1,
    inputCurrency: ENS_MAINNET_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ARBITRUM_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
  expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
});

test('[rap/unlockAndCrosschainSwap] :: create unlock and swap rap without unlock', async () => {
  const rap = await createUnlockAndCrosschainSwapRap({
    tradeDetails: doesntNeedUnlockQuote as CrosschainQuote,
    chainId: 1,
    inputCurrency: ETH_MAINNET_ASSET,
    outputCurrency: USDC_ARBITRUM_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndCrosschainSwap] :: create unlock and swap rap with unlock', async () => {
  const rap = await createUnlockAndCrosschainSwapRap({
    tradeDetails: needsUnlockQuote as CrosschainQuote,
    chainId: 1,
    inputCurrency: ENS_MAINNET_ASSET,
    outputCurrency: USDC_ARBITRUM_ASSET,
  });
  expect(rap.actions.length).toBe(2);
});
