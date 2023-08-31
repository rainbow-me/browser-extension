import { ParsedAsset, ParsedUserAsset, UniqueId } from '~/core/types/assets';
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

export const ETH_MAINNET_ASSET = {
  address: 'eth',
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
} satisfies ParsedUserAsset;

export const DAI_MAINNET_ASSET = {
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  balance: { amount: '0', display: '0 DAI' },
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633496/assets/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png',
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'DAI',
  native: {
    balance: { amount: '0', display: '$0' },
    price: { change: '0.15%', amount: 1634.18, display: '$1,634.18' },
  },
  price: {
    value: 1634.18,
    relative_change_24h: 0.14646492502099484,
    changed_at: -1,
  },
  symbol: 'DAI',
  uniqueId: '0x6b175474e89094c44da98b954eedeac495271d0f_1',
} satisfies ParsedUserAsset;

export const USDC_MAINNET_ASSET = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  balance: { amount: '0', display: '0 USDC' },
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#2775CA' },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'USD Coin',
  native: {
    balance: { amount: '0', display: '$0' },
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
} satisfies ParsedUserAsset;

export const ENS_MAINNET_ASSET = {
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
} satisfies ParsedAsset;

export const USDC_ARBITRUM_ASSET = {
  address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
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
  uniqueId: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8_1' as UniqueId,
  decimals: 6,
} satisfies ParsedAsset;

export const WETH_MAINNET_ASSET = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#25292E', fallback: '#B6B6B7' },
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633499/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  isNativeAsset: false,
  mainnetAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  name: 'Wrapped Ether',
  native: {
    price: {
      change: '-4.93%',
      amount: 1996.9499999999998,
      display: '$1,996.95',
    },
  },
  price: {
    value: 1997.0000000000002,
    relative_change_24h: -4.92966127918878,
    changed_at: -1,
  },
  symbol: 'WETH',
  uniqueId: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_1',
} satisfies ParsedAsset;

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}
