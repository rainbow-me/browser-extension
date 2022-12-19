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
import {
  TEST_ADDRESS_3,
  TEST_PK_3,
  USDC_ARBITRUM_ASSET,
  delay,
} from '~/test/utils';

import { createTestWagmiClient } from '../../wagmi/createTestWagmiClient';

import {
  estimateCrosschainSwapGasLimit,
  executeCrosschainSwap,
} from './crosschainSwap';

let crosschainQuote: CrosschainQuote | QuoteError | null;

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
  crosschainQuote = await getCrosschainQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_3,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_3,
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
  const wallet = new Wallet(TEST_PK_3, provider);

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
