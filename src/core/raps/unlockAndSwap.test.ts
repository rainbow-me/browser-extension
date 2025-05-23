import { Wallet } from '@ethersproject/wallet';
import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  QuoteError,
  getQuote,
} from '@rainbow-me/swaps';
import { mainnet } from 'viem/chains';
import { beforeAll, expect, test, vi } from 'vitest';

import { useConnectedToHardhatStore, useGasStore } from '~/core/state';
import {
  ENS_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  TEST_ADDRESS_2,
  TEST_PK_1,
  USDC_MAINNET_ASSET,
  WETH_MAINNET_ASSET,
  delay,
} from '~/test/utils';

import { GasSpeed } from '../types/gas';
import { updateWagmiConfig } from '../wagmi';
import { getProvider } from '../wagmi/clientToProvider';

import { walletExecuteRap } from './execute';
import { createUnlockAndSwapRap, estimateUnlockAndSwap } from './unlockAndSwap';

let swapGasLimit = 0;

let needsUnlockQuote: Quote | QuoteError | null;
let doesntNeedUnlockQuote: Quote | QuoteError | null;
let ethToEnsQuote: Quote | QuoteError | null;
let unwrapEthQuote: Quote | QuoteError | null;
let wrapEthQuote: Quote | QuoteError | null;

const SELECTED_GAS = {
  display: '73 - 86 Gwei',
  estimatedTime: { amount: 15, display: '~ 15 sec' },
  gasFee: { amount: '4323764263200000', display: '$8.64' },
  maxBaseFee: {
    amount: '800000000000',
    display: '800 Gwei',
    gwei: '800',
  },
  maxPriorityFeePerGas: {
    amount: '3000000000',
    display: '3 Gwei',
    gwei: '3',
  },
  option: GasSpeed.NORMAL,
  transactionGasParams: {
    maxPriorityFeePerGas: '0xb2d05e00',
    maxFeePerGas: '0xba43b74000',
  },
};

vi.mock('./actions', async () => {
  const actual = (await vi.importActual('./actions')) as Record<
    string,
    unknown
  >;

  return {
    ...actual,
    swap: vi.fn().mockResolvedValue({ nonce: 1, hash: '0x123456' }),
    unlock: vi.fn().mockResolvedValue({ nonce: 1, hash: '0x123456' }),
  };
});

// Minimal mock for the wallet to handle provider requests
vi.mock('@ethersproject/wallet', () => ({
  Wallet: vi.fn().mockImplementation(() => ({
    provider: {
      getTransaction: vi.fn().mockResolvedValue({ blockNumber: null }),
    },
  })),
}));

beforeAll(async () => {
  useConnectedToHardhatStore.setState({ connectedToHardhat: true });
  updateWagmiConfig([mainnet]);
  await delay(3000);
  doesntNeedUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
  ethToEnsQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_MAINNET_ASSET.address,
    buyTokenAddress: ENS_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
  needsUnlockQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ENS_MAINNET_ASSET.address,
    buyTokenAddress: USDC_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
  wrapEthQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: ETH_MAINNET_ASSET.address,
    buyTokenAddress: WETH_MAINNET_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
  unwrapEthQuote = await getQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_2,
    sellTokenAddress: WETH_MAINNET_ASSET.address,
    buyTokenAddress: ETH_MAINNET_ASSET.address,
    sellAmount: '100000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_2,
    toChainId: 1,
    currency: 'USD',
  });
}, 20_000);

test.todo(
  '[rap/unlockAndSwap] :: estimate unlock and swap rap without unlock',
  async () => {
    const gasLimit = await estimateUnlockAndSwap({
      quote: doesntNeedUnlockQuote as Quote,
      chainId: 1,
      assetToSell: ETH_MAINNET_ASSET,
      sellAmount: '1000000000000000000',
      assetToBuy: USDC_MAINNET_ASSET,
    });
    expect(Number(gasLimit)).toBeGreaterThan(0);
    swapGasLimit = Number(gasLimit);
  },
);

test.todo(
  '[rap/unlockAndSwap] :: estimate unlock and swap rap with unlock',
  async () => {
    const gasLimit = await estimateUnlockAndSwap({
      quote: needsUnlockQuote as Quote,
      chainId: 1,
      assetToSell: ENS_MAINNET_ASSET,
      sellAmount: '1000000000000000000',
      assetToBuy: USDC_MAINNET_ASSET,
    });
    expect(Number(gasLimit)).toBeGreaterThan(0);
    expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
  },
);

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock and execute it', async () => {
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: doesntNeedUnlockQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: create unlock and swap rap with unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: needsUnlockQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ENS_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(2);
});

test('[rap/unlockAndSwap] :: create swap rap and execute it', async () => {
  const { setSelectedGas } = useGasStore.getState();
  setSelectedGas({
    selectedGas: SELECTED_GAS,
  });
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: ethToEnsQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: ENS_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: create unlock and swap rap with unlock and execute it', async () => {
  const { setSelectedGas } = useGasStore.getState();
  setSelectedGas({
    selectedGas: SELECTED_GAS,
  });
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: needsUnlockQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ENS_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: create unlock and wrap eth rap with unlock and execute it', async () => {
  const { setSelectedGas } = useGasStore.getState();
  setSelectedGas({
    selectedGas: SELECTED_GAS,
  });
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: wrapEthQuote as Quote,
    chainId: 1,
    sellAmount: '1000000000000000000',
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: WETH_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: create unwrap eth rap', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: unwrapEthQuote as Quote,
    chainId: 1,
    sellAmount: '100000000000000000',
    assetToSell: WETH_MAINNET_ASSET,
    assetToBuy: ETH_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndSwap] :: create unwrap weth rap and execute it', async () => {
  const { setSelectedGas } = useGasStore.getState();
  setSelectedGas({
    selectedGas: SELECTED_GAS,
  });
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: unwrapEthQuote as Quote,
    chainId: 1,
    sellAmount: '100000000000000000',
    assetToSell: WETH_MAINNET_ASSET,
    assetToBuy: ETH_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});
