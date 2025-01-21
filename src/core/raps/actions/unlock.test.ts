import { Wallet } from '@ethersproject/wallet';
import { getRainbowRouterContractAddress } from '@rainbow-me/swaps';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { beforeAll, expect, test } from 'vitest';

import { connectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { updateWagmiConfig } from '~/core/wagmi';
import { getProvider } from '~/core/wagmi/clientToProvider';
import {
  RAINBOW_WALLET_ADDRESS,
  TEST_PK_1,
  USDC_MAINNET_ASSET,
  delay,
} from '~/test/utils';

import {
  assetNeedsUnlocking,
  estimateApprove,
  executeApprove,
  getAssetRawAllowance,
} from './unlock';

beforeAll(async () => {
  connectedToHardhatStore.setState({ connectedToHardhat: true });
  updateWagmiConfig([mainnet]);
  await delay(3000);
});

test('[rap/unlock] :: get raw allowance', async () => {
  const params = {
    owner: RAINBOW_WALLET_ADDRESS as `0x${string}`,
    assetAddress: USDC_MAINNET_ASSET.address as `0x${string}`,
    spender: getRainbowRouterContractAddress(mainnet.id),
    chainId: mainnet.id,
  };

  const rawAllowance = await getAssetRawAllowance(params);
  expect(rawAllowance).toBe('0');
});

test('[rap/unlock] :: asset needs unlocking', async () => {
  const needsUnlocking = await assetNeedsUnlocking({
    amount: '1000',
    owner: RAINBOW_WALLET_ADDRESS,
    assetToUnlock: USDC_MAINNET_ASSET,
    spender: getRainbowRouterContractAddress(mainnet.id),
    chainId: mainnet.id,
  });
  expect(needsUnlocking).toBe(true);
});

test('[rap/unlock] :: estimate approve', async () => {
  const approveGasLimit = await estimateApprove({
    owner: RAINBOW_WALLET_ADDRESS,
    tokenAddress: USDC_MAINNET_ASSET.address as Address,
    spender: getRainbowRouterContractAddress(mainnet.id),
    chainId: mainnet.id,
  });
  expect(Number(approveGasLimit)).toBeGreaterThan(0);
});

test('[rap/unlock] :: should execute approve', async () => {
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const approvalTx = await executeApprove({
    gasLimit: '60000',
    gasParams: {
      maxFeePerGas: '800000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    spender: getRainbowRouterContractAddress(mainnet.id),
    tokenAddress: USDC_MAINNET_ASSET.address as Address,
    wallet,
  });
  expect(approvalTx.hash).toBeDefined();
});
