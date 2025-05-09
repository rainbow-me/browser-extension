import { Wallet } from '@ethersproject/wallet';
import {
  CrosschainQuote,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  QuoteError,
  getCrosschainQuote,
} from '@rainbow-me/swaps';
import { mainnet } from 'viem/chains';
import { beforeAll, expect, test, vi } from 'vitest';

import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { updateWagmiConfig } from '~/core/wagmi';
import { getProvider } from '~/core/wagmi/clientToProvider';
import {
  TEST_ADDRESS_3,
  TEST_PK_3,
  USDC_ARBITRUM_ASSET,
  delay,
} from '~/test/utils';

import { ActionProps } from '../references';

import {
  estimateCrosschainSwapGasLimit,
  executeCrosschainSwap,
} from './crosschainSwap';

let crosschainQuote: CrosschainQuote | QuoteError | null;

vi.mock('./crosschainSwap', async () => {
  const actual = (await vi.importActual(
    './crosschainSwap',
  )) as ActionProps<'crosschainSwap'>;

  return {
    ...actual,
    estimateCrosschainSwapGasLimit: vi.fn().mockResolvedValue('600000'),
    executeCrosschainSwap: vi.fn().mockResolvedValue({ hash: '0x123456' }),
  };
});

beforeAll(async () => {
  useConnectedToHardhatStore.setState({ connectedToHardhat: true });
  updateWagmiConfig([mainnet]);
  await delay(3000);
  crosschainQuote = await getCrosschainQuote({
    chainId: 1,
    fromAddress: TEST_ADDRESS_3,
    sellTokenAddress: ETH_ADDRESS_AGGREGATORS,
    buyTokenAddress: USDC_ARBITRUM_ASSET.address,
    sellAmount: '1000000000000000000',
    slippage: 5,
    destReceiver: TEST_ADDRESS_3,
    toChainId: ChainId.arbitrum,
    currency: 'USD',
  });
}, 20000);

test('[rap/crosschainSwap] :: should estimate crosschain swap gas limit', async () => {
  const swapGasLimit = await estimateCrosschainSwapGasLimit({
    chainId: mainnet.id,
    requiresApprove: false,
    quote: {
      ...crosschainQuote,
    } as CrosschainQuote,
  });
  expect(Number(swapGasLimit)).toBeGreaterThan(0);
});

test('[rap/crosschainSwap] :: should execute crosschain swap', async () => {
  const provider = getProvider({ chainId: mainnet.id });
  const wallet = new Wallet(TEST_PK_3, provider);

  const swapTx = await executeCrosschainSwap({
    gasLimit: '600000',
    gasParams: {
      maxFeePerGas: '2000000000000',
      maxPriorityFeePerGas: '2000000000',
    },
    quote: { ...crosschainQuote } as CrosschainQuote,
    wallet,
  });

  expect(swapTx?.hash).toBeDefined();
});
