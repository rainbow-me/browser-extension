import { RAINBOW_ROUTER_CONTRACT_ADDRESS } from '@rainbow-me/swaps';
import { chain, getProvider } from '@wagmi/core';
import { Wallet } from 'ethers';
import { beforeAll, expect, test } from 'vitest';

import { createTestWagmiClient } from '../../wagmi/createTestWagmiClient';
import { USDC_MAINNET_ASSET } from '../unlockAndSwap.test';

import {
  assetNeedsUnlocking,
  estimateApprove,
  executeApprove,
  getRawAllowance,
} from './unlock';

const RAINBOW_WALLET = '0x7a3d05c70581bd345fe117c06e45f9669205384f';

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
});

test('[rap/unlock] :: get raw allowance', async () => {
  const rawAllowance = await getRawAllowance({
    owner: RAINBOW_WALLET,
    token: USDC_MAINNET_ASSET,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(rawAllowance).toBe('0');
});

test('[rap/unlock] :: asset needs unlocking', async () => {
  const needsUnlocking = await assetNeedsUnlocking({
    amount: '1000',
    owner: RAINBOW_WALLET,
    assetToUnlock: USDC_MAINNET_ASSET,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(needsUnlocking).toBe(true);
});

test('[rap/unlock] :: estimate approve', async () => {
  const approveGasLimit = await estimateApprove({
    owner: RAINBOW_WALLET,
    tokenAddress: USDC_MAINNET_ASSET.address,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(Number(approveGasLimit)).toBeGreaterThan(0);
});

test('[rap/unlock] :: should execute approve', async () => {
  const provider = getProvider({ chainId: chain.mainnet.id });
  const wallet = new Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider,
  );
  const approvalTx = await executeApprove({
    chainId: chain.mainnet.id,
    gasLimit: '60000',
    gasParams: {
      maxFeePerGas: '200000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    tokenAddress: USDC_MAINNET_ASSET.address,
    wallet,
  });
  expect(approvalTx.hash).toBeDefined();
});
