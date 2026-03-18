import { Wallet } from '@ethersproject/wallet';
import {
  type Quote,
  type QuoteError,
  SwapType,
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
import { updateViemClientsWrapper } from '../viem';
import { getProvider } from '../viem/clientToProvider';

import { walletExecuteRap } from './execute';
import { createUnlockAndSwapRap, estimateUnlockAndSwap } from './unlockAndSwap';

let swapGasLimit = 0;

let needsUnlockQuote: Quote;
let doesntNeedUnlockQuote: Quote;
let ethToEnsQuote: Quote;
let unwrapEthQuote: Quote;
let wrapEthQuote: Quote;

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

function withSwapType(quote: Quote, swapType: Quote['swapType']): Quote {
  return { ...quote, swapType };
}

function requireQuote(quote: Quote | QuoteError | null, label: string): Quote {
  if (!quote) {
    throw new Error(`[rap/unlockAndSwap.test] ${label} quote missing`);
  }

  if ('error' in quote) {
    throw new Error(
      `[rap/unlockAndSwap.test] ${label} quote error: ${quote.message}`,
    );
  }

  return quote;
}

vi.mock('@rainbow-me/delegation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    supportsDelegation: vi.fn().mockResolvedValue({ supported: false }),
    executeBatchedTransaction: vi.fn(),
  };
});

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
  Wallet: vi.fn(function () {
    return {
      getAddress: vi
        .fn()
        .mockResolvedValue('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
      provider: {
        getTransaction: vi.fn().mockResolvedValue({ blockNumber: null }),
      },
    };
  }),
}));

beforeAll(async () => {
  useConnectedToHardhatStore.setState({ connectedToHardhat: true });
  updateViemClientsWrapper([mainnet]);
  await delay(3000);
  doesntNeedUnlockQuote = requireQuote(
    await getQuote({
      chainId: 1,
      fromAddress: TEST_ADDRESS_2,
      sellTokenAddress: ETH_MAINNET_ASSET.address,
      buyTokenAddress: USDC_MAINNET_ASSET.address,
      sellAmount: 1000000000000000000n,
      slippage: 5,
      destReceiver: TEST_ADDRESS_2,
      toChainId: 1,
      currency: 'USD',
    }),
    'doesntNeedUnlockQuote',
  );
  ethToEnsQuote = requireQuote(
    await getQuote({
      chainId: 1,
      fromAddress: TEST_ADDRESS_2,
      sellTokenAddress: ETH_MAINNET_ASSET.address,
      buyTokenAddress: ENS_MAINNET_ASSET.address,
      sellAmount: 1000000000000000000n,
      slippage: 5,
      destReceiver: TEST_ADDRESS_2,
      toChainId: 1,
      currency: 'USD',
    }),
    'ethToEnsQuote',
  );
  needsUnlockQuote = requireQuote(
    await getQuote({
      chainId: 1,
      fromAddress: TEST_ADDRESS_2,
      sellTokenAddress: ENS_MAINNET_ASSET.address,
      buyTokenAddress: USDC_MAINNET_ASSET.address,
      sellAmount: 1000000000000000000n,
      slippage: 5,
      destReceiver: TEST_ADDRESS_2,
      toChainId: 1,
      currency: 'USD',
    }),
    'needsUnlockQuote',
  );
  wrapEthQuote = requireQuote(
    await getQuote({
      chainId: 1,
      fromAddress: TEST_ADDRESS_2,
      sellTokenAddress: ETH_MAINNET_ASSET.address,
      buyTokenAddress: WETH_MAINNET_ASSET.address,
      sellAmount: 1000000000000000000n,
      slippage: 5,
      destReceiver: TEST_ADDRESS_2,
      toChainId: 1,
      currency: 'USD',
    }),
    'wrapEthQuote',
  );
  unwrapEthQuote = requireQuote(
    await getQuote({
      chainId: 1,
      fromAddress: TEST_ADDRESS_2,
      sellTokenAddress: WETH_MAINNET_ASSET.address,
      buyTokenAddress: ETH_MAINNET_ASSET.address,
      sellAmount: 100000000000000000n,
      slippage: 5,
      destReceiver: TEST_ADDRESS_2,
      toChainId: 1,
      currency: 'USD',
    }),
    'unwrapEthQuote',
  );
}, 20_000);

test.todo(
  '[rap/unlockAndSwap] :: estimate unlock and swap rap without unlock',
  async () => {
    const gasLimit = await estimateUnlockAndSwap({
      quote: doesntNeedUnlockQuote,
      chainId: 1,
      assetToSell: ETH_MAINNET_ASSET,
      sellAmount: 1000000000000000000n,
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
      quote: needsUnlockQuote,
      chainId: 1,
      assetToSell: ENS_MAINNET_ASSET,
      sellAmount: 1000000000000000000n,
      assetToBuy: USDC_MAINNET_ASSET,
    });
    expect(Number(gasLimit)).toBeGreaterThan(0);
    expect(Number(gasLimit)).toBeGreaterThan(swapGasLimit);
  },
);

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: doesntNeedUnlockQuote,
    chainId: 1,
    sellAmount: 1000000000000000000n,
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(rap.actions.length).toBe(1);
});

test('[rap/unlockAndSwap] :: create unlock and swap rap without unlock and execute it', async () => {
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_1, provider);
  const swap = await walletExecuteRap(wallet, 'swap', {
    quote: doesntNeedUnlockQuote,
    chainId: 1,
    sellAmount: 1000000000000000000n,
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: USDC_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: create unlock and swap rap with unlock', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: needsUnlockQuote,
    chainId: 1,
    sellAmount: 1000000000000000000n,
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
    quote: ethToEnsQuote,
    chainId: 1,
    sellAmount: 1000000000000000000n,
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
    quote: needsUnlockQuote,
    chainId: 1,
    sellAmount: 1000000000000000000n,
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
    quote: withSwapType(wrapEthQuote, SwapType.wrap),
    chainId: 1,
    sellAmount: 1000000000000000000n,
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: WETH_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});

test('[rap/unlockAndSwap] :: unwrap bypasses target checks even with allowance fields', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: {
      ...withSwapType(unwrapEthQuote, SwapType.unwrap),
      allowanceNeeded: true,
      allowanceTarget: TEST_ADDRESS_2,
    },
    chainId: 1,
    sellAmount: 100000000000000000n,
    assetToSell: WETH_MAINNET_ASSET,
    assetToBuy: ETH_MAINNET_ASSET,
  });

  expect(rap.actions).toHaveLength(1);
});

test('[rap/unlockAndSwap] :: wrap bypasses target checks even with allowance fields', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: {
      ...withSwapType(wrapEthQuote, SwapType.wrap),
      allowanceNeeded: true,
      allowanceTarget: TEST_ADDRESS_2,
    },
    chainId: 1,
    sellAmount: 1000000000000000000n,
    assetToSell: ETH_MAINNET_ASSET,
    assetToBuy: WETH_MAINNET_ASSET,
  });

  expect(rap.actions).toHaveLength(1);
});

test('[rap/unlockAndSwap] :: standard ERC20 swaps still enforce target allowlist', async () => {
  await expect(
    createUnlockAndSwapRap({
      quote: {
        ...needsUnlockQuote,
        allowanceNeeded: true,
        allowanceTarget: TEST_ADDRESS_2,
      },
      chainId: 1,
      sellAmount: 1000000000000000000n,
      assetToSell: ENS_MAINNET_ASSET,
      assetToBuy: USDC_MAINNET_ASSET,
    }),
  ).rejects.toThrow('Target contract is not allowed');
});

test('[rap/unlockAndSwap] :: create unwrap eth rap', async () => {
  const rap = await createUnlockAndSwapRap({
    quote: withSwapType(unwrapEthQuote, SwapType.unwrap),
    chainId: 1,
    sellAmount: 100000000000000000n,
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
    quote: withSwapType(unwrapEthQuote, SwapType.unwrap),
    chainId: 1,
    sellAmount: 100000000000000000n,
    assetToSell: WETH_MAINNET_ASSET,
    assetToBuy: ETH_MAINNET_ASSET,
  });
  expect(swap.nonce).toBeDefined();
});
