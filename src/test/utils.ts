import { Address } from 'wagmi';

import { ParsedAddressAsset, ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';

export const TEST_ADDRESS_1 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
export const TEST_PK_1 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
export const TEST_ADDRESS_2 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
export const TEST_PK_2 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
export const TEST_ADDRESS_3 = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';
export const TEST_PK_3 =
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

export const RAINBOW_WALLET_ADDRESS =
  '0x7a3d05c70581bd345fe117c06e45f9669205384f';

export const ETH_MAINNET_ASSET: ParsedAddressAsset = {
  address: 'eth' as Address,
  balance: { amount: '10000', display: '10,000.00 ETH' },
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  decimals: 18,
  icon_url: '',
  isNativeAsset: true,
  mainnetAddress: undefined,
  name: 'Ethereum',
  native: {
    balance: { amount: '16341800', display: '$16,341,800.00' },
    price: { change: '0.15%', amount: 1634.18, display: '$1,634.18' },
  },
  price: {
    value: 1634.18,
    relative_change_24h: 0.14646492502099484,
    changed_at: -1,
  },
  symbol: 'ETH',
  uniqueId: 'eth_1',
};
export const USDC_MAINNET_ASSET: ParsedAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
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
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
    changed_at: -1,
  },
  symbol: 'USDC',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 6,
};
export const ENS_MAINNET_ASSET: ParsedAsset = {
  address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#6E9BF8' },
  isNativeAsset: false,
  name: 'Ethereum Name Service',
  native: {
    price: { change: '0.64%', amount: 13.984137272000002, display: '$13.98' },
  },
  price: {
    changed_at: -1,
    relative_change_24h: 0.6397137281285907,
    value: 13.984137272000002,
  },
  symbol: 'ENS',
  uniqueId: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72_1',
  decimals: 18,
};

export const USDC_ARBITRUM_ASSET: ParsedAsset = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
  chainId: ChainId.arbitrum,
  chainName: ChainName.arbitrum,
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
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
    changed_at: -1,
  },
  symbol: 'USDC',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 6,
};

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}
