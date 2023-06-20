import { BigNumberish } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
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
  data?: string; // for pending tx
  description?: string;
  direction?: string;
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
  status?: TransactionStatus;
  symbol?: string;
  title?: string;
  to?: Address;
  txTo?: string;
  type?: TransactionType;
  value?: BigNumberish; // for pending tx
  flashbots?: boolean;
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
  status?: TransactionStatus;
  to?: Address;
  type?: TransactionType;
  value?: BigNumberish;
  txTo?: Address;
  flashbots?: boolean;
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
  confirmed = 'confirmed',
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

export interface ExecuteRapResponse extends TransactionResponse {
  errorMessage?: string;
}
