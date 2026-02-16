import { getRainbowRouterContractAddress } from '@rainbow-me/swaps';
import { Address, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { beforeAll, expect, test, vi } from 'vitest';

import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { updateViemClientsWrapper } from '~/core/viem';
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

vi.mock('./unlock', async (importOriginal) => {
  const originalModule = (await importOriginal()) as Record<string, unknown>;

  return {
    ...originalModule,
    getAssetRawAllowance: vi.fn().mockResolvedValue('0'),
  };
});

beforeAll(async () => {
  useConnectedToHardhatStore.setState({ connectedToHardhat: true });
  updateViemClientsWrapper([mainnet]);
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
  const mockTxHash =
    '0x123456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;
  const account = privateKeyToAccount(TEST_PK_1);
  const wallet = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  });
  wallet.writeContract = vi.fn().mockResolvedValue(mockTxHash);

  const approvalTx = await executeApprove({
    gasLimit: 60000n,
    gasParams: {
      maxFeePerGas: BigInt('800000000000'),
      maxPriorityFeePerGas: BigInt('2000000000'),
    },
    spender: getRainbowRouterContractAddress(mainnet.id),
    tokenAddress: USDC_MAINNET_ASSET.address as Address,
    wallet,
    chainId: mainnet.id,
  });
  expect(approvalTx.hash).toBe(mockTxHash);
});
