import {
  CrosschainQuote,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  QuoteError,
  SwapType,
  getCrosschainQuote,
} from '@rainbow-me/swaps';
import { chain, getProvider } from '@wagmi/core';
import { Wallet } from 'ethers';
import { beforeAll, expect, test } from 'vitest';

import { ChainId } from '~/core/types/chains';

import { createTestWagmiClient } from '../../wagmi/createTestWagmiClient';

import {
  estimateCrosschainSwapGasLimit,
  executeCrosschainSwap,
} from './crosschainSwap';

const ARBITRUM_USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
const TEST_ADDRESS = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';
const TEST_PKEY =
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let crosschainQuote: CrosschainQuote | QuoteError | null;

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
  crosschainQuote = await getCrosschainQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: ARBITRUM_USDC,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS,
    swapType: SwapType.crossChain,
    toChainId: ChainId.arbitrum,
  });
}, 10000);

test('[rap/crosschainSwap] :: should estimate crosschain swap gas limit', async () => {
  const swapGasLimit = await estimateCrosschainSwapGasLimit({
    chainId: chain.mainnet.id,
    requiresApprove: false,
    tradeDetails: crosschainQuote as CrosschainQuote,
  });

  expect(Number(swapGasLimit)).toBeGreaterThan(0);
});

test('[rap/crosschainSwap] :: should execute crosschain swap', async () => {
  const provider = getProvider({ chainId: chain.mainnet.id });
  const wallet = new Wallet(TEST_PKEY, provider);

  const swapTx = await executeCrosschainSwap({
    gasLimit: '600000',
    transactionGasParams: {
      maxFeePerGas: '2000000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    tradeDetails: crosschainQuote as CrosschainQuote,
    wallet,
  });

  expect(swapTx?.hash).toBeDefined();
});
