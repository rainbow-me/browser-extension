import { Wallet } from '@ethersproject/wallet';
import { RAINBOW_ROUTER_CONTRACT_ADDRESS } from '@rainbow-me/swaps';
import { chain, getProvider } from '@wagmi/core';
import { beforeAll, expect, test } from 'vitest';
import { Address } from 'wagmi';

import {
  RAINBOW_WALLET_ADDRESS,
  TEST_PK_1,
  USDC_MAINNET_ASSET,
  delay,
} from '~/test/utils';

import { createTestWagmiClient } from '../../wagmi/createTestWagmiClient';

import {
  assetNeedsUnlocking,
  estimateApprove,
  executeApprove,
  getAssetRawAllowance,
} from './unlock';

beforeAll(async () => {
  createTestWagmiClient();
  await delay(3000);
});

test('[rap/unlock] :: get raw allowance', async () => {
  const rawAllowance = await getAssetRawAllowance({
    owner: RAINBOW_WALLET_ADDRESS,
    assetAddress: USDC_MAINNET_ASSET.address as Address,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(rawAllowance).toBe('0');
});

test('[rap/unlock] :: asset needs unlocking', async () => {
  const needsUnlocking = await assetNeedsUnlocking({
    amount: '1000',
    owner: RAINBOW_WALLET_ADDRESS,
    assetToUnlock: USDC_MAINNET_ASSET,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(needsUnlocking).toBe(true);
});

test('[rap/unlock] :: estimate approve', async () => {
  const approveGasLimit = await estimateApprove({
    owner: RAINBOW_WALLET_ADDRESS,
    tokenAddress: USDC_MAINNET_ASSET.address as Address,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  expect(Number(approveGasLimit)).toBeGreaterThan(0);
});

test('[rap/unlock] :: should execute approve', async () => {
  const provider = getProvider({ chainId: chain.mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const approvalTx = await executeApprove({
    chainId: chain.mainnet.id,
    gasLimit: '60000',
    gasParams: {
      maxFeePerGas: '800000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    tokenAddress: USDC_MAINNET_ASSET.address as Address,
    wallet,
  });
  expect(approvalTx.hash).toBeDefined();
});
