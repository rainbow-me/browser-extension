import { RAINBOW_ROUTER_CONTRACT_ADDRESS } from '@rainbow-me/swaps';
import { Address, chain } from '@wagmi/core';
import { beforeAll, test } from 'vitest';

import { ParsedAsset, UniqueId } from '../types/assets';
import { ChainName } from '../types/chains';
import { createTestWagmiClient } from '../wagmi/createTestWagmiClient';

import {
  assetNeedsUnlocking,
  estimateApprove,
  getRawAllowance,
} from './unlock';

const RAINBOW_WALLET = '0x7a3d05c70581bd345fe117c06e45f9669205384f';

const USDC_ASSET: ParsedAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  //   balance: { amount: '8.721623', display: '8.722 USDC' },
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#2775CA' },
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'USD Coin',
  native: {
    price: {
      amount: 1.000587633346778,
      change: '-1.34%',
      display: '$1.00',
    },
    // balance: {
    //   amount: '8.726748116512825980694',
    //   display: '$8.73',
    // },
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
    changed_at: -1,
  },
  symbol: 'USDC',
  type: 'stablecoin',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 18,
};

beforeAll(() => {
  createTestWagmiClient();
});

test('[rap/unlock] :: get raw allowance', async () => {
  const rawAllowance = await getRawAllowance({
    owner: RAINBOW_WALLET,
    token: USDC_ASSET,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  console.log('RAWWW ALLOWANCE', rawAllowance);
});

test('[rap/unlock] :: asset needs unlocking', async () => {
  const rawAllowance = await assetNeedsUnlocking({
    amount: '1000',
    accountAddress: RAINBOW_WALLET,
    assetToUnlock: USDC_ASSET,
    contractAddress: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  console.log('RAWWW ALLOWANCE', rawAllowance);
});

test('[rap/unlock] :: estimate approve', async () => {
  const rawAllowance = await estimateApprove({
    owner: RAINBOW_WALLET,
    tokenAddress: USDC_ASSET.address,
    spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    chainId: chain.mainnet.id,
  });
  console.log('RAWWW ALLOWANCE', rawAllowance);
});
