import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  SwapType,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';
import { Address } from 'wagmi';

import { ParsedAsset, UniqueId } from '../types/assets';
import { ChainName } from '../types/chains';
import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import { estimateUnlockAndSwap } from './unlockAndSwap';

const TEST_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
// const TEST_PKEY =
//   '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

const ETH_ASSET: ParsedAsset = {
  address: 'eth' as Address,
  // balance: {amount: '0.176706411676362127', display: '0.17670641 ETH'},
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
    // balance: {amount: '228.2728767317581582424223352724254', display: '$228.27'}
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
  //   balance: { amount: '8.721623', display: '8.722 USDC' },
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
    // balance: {
    //   amount: '8.726748116512825980694',
    //   display: '$8.73',
    // },
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
    changed_at: -1,
  },
  symbol: 'USDC',
  type: 'stablecoin',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 18,
};

const ENS_ASSET: ParsedAsset = {
  address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  //   balance: { amount: '190.694524689290256384', display: '190.695 ENS' },
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

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
});

test('[rap/unlockAndSwap] :: estimate unlock and swap rap without unlock', async () => {
  const quote = await getQuote({
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
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: quote as Quote,
    chainId: 1,
    inputCurrency: ETH_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ASSET,
  });

  expect(Number(gasLimit)).toBeGreaterThan(0);
}, 10000);

test('[rap/unlockAndSwap] :: estimate unlock and swap rap with unlock', async () => {
  const quote = await getQuote({
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
  const gasLimit = await estimateUnlockAndSwap({
    tradeDetails: quote as Quote,
    chainId: 1,
    inputCurrency: ENS_ASSET,
    inputAmount: '1000000000000000000',
    outputCurrency: USDC_ASSET,
  });
  expect(Number(gasLimit)).toBeGreaterThan(0);
}, 10000);
