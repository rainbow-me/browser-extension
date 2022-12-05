import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  Source,
  SwapType,
  getQuote,
} from '@rainbow-me/swaps';
import { chain, getProvider } from '@wagmi/core';
import { Wallet } from 'ethers';
import { beforeAll, expect, test } from 'vitest';

import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import { estimateSwapGasLimit, executeSwap } from './swap';

const TEST_ADDRESS = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const TEST_PKEY =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const QUOTE = {
  sellTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  allowanceTarget: '0x0000000000000000000000000000000000000000',
  to: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  data: '0x3598d8ab000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000478daa2b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000869584cd0000000000000000000000001000000000000000000000000000000000000011000000000000000000000000000000000000000000000041f21e1365638e0fda',
  sellAmount: '1000000000000000000',
  buyAmount: '1263648922',
  value: '1000000000000000000',
  gasPrice: '29500000000',
  source: Source.Aggregator0x,
  protocols: [{ name: 'Uniswap_V3', part: 100 }],
  fee: '0',
  feePercentageBasisPoints: 0,
  sellAmountMinusFees: '1000000000000000000',
  tradeType: 'exact_input',
  from: TEST_ADDRESS,
  defaultGasLimit: '300000',
  swapType: 'normal',
  txTarget: '0x00000000009726632680fb29d3f7a9734e3010e2',
  sellAmountInEth: '1000000000000000000',
  buyAmountInEth: '999654193204642295',
};

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
});

test('[rap/unlock] :: should estimate swap gas limit', async () => {
  const swapGasLimit = await estimateSwapGasLimit({
    chainId: chain.mainnet.id,
    requiresApprove: false,
    tradeDetails: QUOTE,
  });

  expect(Number(swapGasLimit)).toBeGreaterThan(0);
});

test('[rap/unlock] :: should execute swap', async () => {
  const provider = getProvider({ chainId: chain.mainnet.id });
  const wallet = new Wallet(TEST_PKEY, provider);

  const quote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.normal,
    toChainId: 1,
  });

  const swapTx = await executeSwap({
    chainId: chain.mainnet.id,
    gasLimit: '600000',
    transactionGasParams: {
      maxFeePerGas: '200000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    tradeDetails: quote as Quote,
    wallet,
    permit: false,
  });

  expect(swapTx?.hash).toBeDefined();
});
