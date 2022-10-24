import { createWebSocketClient } from './internal/createWebSocketClient';

export enum Network {
  arbitrum = 'arbitrum',
  goerli = 'goerli',
  mainnet = 'mainnet',
  optimism = 'optimism',
  polygon = 'polygon',
}

export interface ZerionAssetPrice {
  value: number;
  relative_change_24h?: number;
  changed_at: number;
}

export enum AssetType {
  arbitrum = 'arbitrum',
  compound = 'compound',
  eth = 'eth',
  nft = 'nft',
  optimism = 'optimism',
  polygon = 'polygon',
  token = 'token',
  trash = 'trash',
  uniswap = 'uniswap',
  uniswapV2 = 'uniswap-v2',
}

export interface ZerionAsset {
  asset_code: string;
  name: string;
  symbol: string;
  decimals: number;
  type: AssetType;
  icon_url?: string;
  price?: ZerionAssetPrice;
}

/**
 * Metadata for a message from the Zerion API.
 */
export interface MessageMeta {
  address?: string;
  currency?: string;
  status?: string;
  chain_id?: Network; // L2
}

/**
 * A message from the Zerion API indicating that assets were received.
 */
export interface AddressAssetsReceivedMessage {
  payload?: {
    assets?: {
      [id: string]: {
        asset: ZerionAsset;
        quantity: string;
      };
    };
  };
  meta?: MessageMeta;
}

export enum TransactionType {
  authorize = 'authorize',
  borrow = 'borrow',
  cancel = 'cancel',
  contract_interaction = 'contract interaction',
  deployment = 'deployment',
  deposit = 'deposit',
  dropped = 'dropped',
  execution = 'execution',
  purchase = 'purchase', // Rainbow-specific type
  receive = 'receive',
  repay = 'repay',
  send = 'send',
  trade = 'trade',
  withdraw = 'withdraw',
}

export enum ProtocolType {
  aave = 'aave',
  bancor = 'bancor',
  compound = 'compound',
  curve = 'curve',
  disperse_app = 'disperse_app',
  dsr = 'dsr',
  dydx = 'dydx',
  fulcrum = 'fulcrum',
  iearn = 'iearn',
  kyber = 'kyber',
  maker = 'maker',
  maker_dss = 'maker_dss',
  one_inch = 'one_inch',
  pool_together = 'pool_together',
  ray = 'ray',
  rainbow = 'rainbow',
  set = 'set',
  socket = 'socket',
  synthetix = 'synthetix',
  uniswap = 'uniswap',
  zrx_stacking = 'zrx_stacking',
  zrx_staking = 'zrx_staking',
}

export enum TransactionDirection {
  in = 'in',
  out = 'out',
  self = 'self',
}

interface ZerionTransactionFee {
  price: number;
  value: number;
}

interface ZerionTransactionMeta {
  action?: string;
  application?: string;
  asset?: ZerionAsset;
}

export enum ZerionTransactionStatus {
  confirmed = 'confirmed',
  failed = 'failed',
  pending = 'pending',
}

export interface ZerionTransactionChange {
  address_from: string;
  address_to: string;
  asset: ZerionAsset;
  price?: number;
  value?: number;
  direction: TransactionDirection;
}

export interface ZerionTransaction {
  address_from: string;
  address_to: string;
  block_number: number;
  changes: ZerionTransactionChange[];
  contract: string;
  direction: TransactionDirection;
  fee: ZerionTransactionFee;
  hash: string;
  id: string;
  meta: ZerionTransactionMeta;
  mined_at: number;
  nonce: number;
  protocol: ProtocolType;
  status: ZerionTransactionStatus;
  type: TransactionType;
}

/**
 * A message from the Zerion API indicating that transaction data was received.
 */
export interface TransactionsReceivedMessage {
  payload?: {
    transactions?: ZerionTransaction[];
  };
  meta?: MessageMeta;
}

export const refractionAddressMessages = {
  ADDRESS_ASSETS: {
    APPENDED: 'appended address assets',
    CHANGED: 'changed address assets',
    RECEIVED: 'received address assets',
    RECEIVED_ARBITRUM: 'received address arbitrum-assets',
    RECEIVED_OPTIMISM: 'received address optimism-assets',
    RECEIVED_POLYGON: 'received address polygon-assets',
    REMOVED: 'removed address assets',
  },
  ADDRESS_TRANSACTIONS: {
    APPENDED: 'appended address transactions',
    CHANGED: 'changed address transactions',
    RECEIVED: 'received address transactions',
    RECEIVED_ARBITRUM: 'received address arbitrum-transactions',
    RECEIVED_OPTIMISM: 'received address optimism-transactions',
    RECEIVED_POLYGON: 'received address polygon-transactions',
    REMOVED: 'removed address transactions',
  },
};

export const refractionAddressWs = createWebSocketClient({
  baseUrl: `${process.env.DATA_ENDPOINT}/address`,
  headers: { origin: process.env.DATA_ORIGIN || '' },
  query: {
    api_token: process.env.DATA_API_KEY,
  },
});
