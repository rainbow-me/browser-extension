import { beforeAll, expect, test } from 'vitest';
import { chain } from 'wagmi';

import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import { estimateSwapGasLimit } from './swap';

const QUOTE = {
  sellTokenAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  allowanceTarget: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  to: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  data: '0xd9627aa4000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000009ec08da51d9200000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000000000000000009fb955af4a638a55de',
  sellAmount: '176033521020108',
  buyAmount: '1000',
  value: '0',
  gasPrice: '15000000000',
  protocols: [{ name: 'Uniswap_V2', part: 100 }],
  fee: '1483673702202',
  feePercentageBasisPoints: 8500000000000000,
  sellAmountMinusFees: '173066173615704',
  tradeType: 'exact_output',
  from: '0x7a3d05c70581bd345fe117c06e45f9669205384f',
  defaultGasLimit: '300000',
  swapType: 'normal',
  txTarget: '0x00000000009726632680fb29d3f7a9734e3010e2',
  sellAmountInEth: '837814955509',
  buyAmountInEth: '780157365179',
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
  expect(swapGasLimit).toBe('600000');
});
