import { Wallet } from '@ethersproject/wallet';
import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  getQuote,
} from '@rainbow-me/swaps';
import { beforeAll, expect, test } from 'vitest';

import { connectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { chainHardhat } from '~/core/types/chains';
import { updateWagmiConfig } from '~/core/wagmi';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { TEST_ADDRESS_2, TEST_PK_2, delay } from '~/test/utils';

import { estimateSwapGasLimit, executeSwap } from './swap';

let quote: Quote | QuoteError | null;

beforeAll(async () => {
  connectedToHardhatStore.setState({ connectedToHardhat: true });
  updateWagmiConfig([chainHardhat]);
  await delay(3000);
  quote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
}, 10000);

test('[rap/swap] :: should estimate swap gas limit', async () => {
  const swapGasLimit = await estimateSwapGasLimit({
    chainId: chainHardhat.id,
    requiresApprove: false,
    quote: quote as Quote,
  });

  expect(Number(swapGasLimit)).toBeGreaterThan(0);
});

test('[rap/swap] :: should execute swap', async () => {
  const provider = getProvider({ chainId: chainHardhat.id });
  const wallet = new Wallet(TEST_PK_2, provider);
  const swapTx = await executeSwap({
    chainId: chainHardhat.id,
    gasLimit: '600000',
    gasParams: {
      maxFeePerGas: '800000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    quote: quote as Quote,
    wallet,
  });

  expect(swapTx?.hash).toBeDefined();
});
