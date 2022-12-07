import { BigNumberish } from 'ethers';
import { Address } from 'wagmi';

import { ParsedAsset, ZerionAsset } from './assets';
import { ChainId } from './chains';

export interface RainbowTransaction {
  address?: Address;
  asset?: ParsedAsset | null;
  balance?: {
    amount: string;
    display: string;
  };
  dappName?: string; // for walletconnect
  data?: string; // for pending tx
  description?: string;
  from?: Address;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  hash?: string;
  minedAt?: number;
  name?: string;
  native?: {
    amount: string;
    display: string;
  };
  chainId: ChainId;
  nonce?: number;
  pending?: boolean;
  protocol?: ProtocolType;
  flashbots?: boolean;
  ensCommitRegistrationName?: string;
  ensRegistration?: boolean;
  sourceAmount?: string; // for purchases
  status?: TransactionStatus;
  symbol?: string;
  timestamp?: number; // for purchases
  title?: string;
  to?: Address;
  transferId?: string; // for purchases
  txTo?: string;
  type?: TransactionType;
  value?: BigNumberish; // for pending tx
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

interface ZerionTransactionFee {
  price: number;
  value: number;
}

interface ZerionTransactionMeta {
  action?: string;
  application?: string;
  asset?: ZerionAsset;
}

export interface ZerionTransactionChange {
  address_from: string;
  address_to: string;
  asset: ZerionAsset;
  price?: number;
  value?: number;
  direction: TransactionDirection;
}

export enum ZerionTransactionStatus {
  confirmed = 'confirmed',
  failed = 'failed',
  pending = 'pending',
}

export interface NewTransaction {
  amount?: string;
  asset?: ParsedAsset | null;
  dappName?: string; // for walletconnect
  data?: string;
  from?: Address;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  hash?: string;
  chainId?: ChainId;
  nonce?: number;
  protocol?: ProtocolType;
  flashbots?: boolean;
  ensCommitRegistrationName?: string;
  ensRegistration?: boolean;
  sourceAmount?: string; // for purchases
  status?: TransactionStatus;
  timestamp?: number; // for purchases
  to: Address;
  transferId?: string; // for purchases
  type?: TransactionType;
  value?: BigNumberish;
  txTo?: Address;
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
export enum TransactionStatus {
  approved = 'approved',
  approving = 'approving',
  bridging = 'bridging',
  bridged = 'bridged',
  cancelled = 'cancelled',
  cancelling = 'cancelling',
  contract_interaction = 'contract interaction',
  deposited = 'deposited',
  depositing = 'depositing',
  dropped = 'dropped',
  failed = 'failed',
  purchased = 'purchased',
  purchasing = 'purchasing',
  received = 'received',
  receiving = 'receiving',
  self = 'self',
  sending = 'sending',
  sent = 'sent',
  speeding_up = 'speeding up',
  swapped = 'swapped',
  swapping = 'swapping',
  unknown = 'unknown status',
  withdrawing = 'withdrawing',
  withdrew = 'withdrew',
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
export enum TransactionDirection {
  in = 'in',
  out = 'out',
  self = 'self',
}

export const newTestTx: NewTransaction = {
  type: TransactionType.trade,
  chainId: 1,
  nonce: 46,
  maxPriorityFeePerGas: '200000000000',
  maxFeePerGas: '200000000000',
  gasLimit: '600000',
  to: '0x00000000009726632680FB29d3F7A9734E3010E2',
  value: '1000000000000000000',
  data: '0x3c2b9a7d000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000001e32b47897400000000000000000000000000000000000000000000000000000000000000001083598d8ab000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000465b71cf0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000064a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000869584cd00000000000000000000000010000000000000000000000000000000000000110000000000000000000000000000000000000000000000b5b7483cb7638f5dbd000000000000000000000000000000000000000000000000',
  hash: '0xef809919a5ead3b6589f0ac85868bb9e1036a500bd5b75cb2a33abec3ad7716f',
  from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  status: TransactionStatus.swapping,
};
