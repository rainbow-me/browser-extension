import { BigNumberish } from 'ethers';
import { ChainName } from '~/core/types/chains';
import { ZerionAsset } from './assets';

export interface RainbowTransaction {
  address?: string;
  balance?: {
    amount: string;
    display: string;
  };
  dappName?: string; // for walletconnect
  data?: string; // for pending tx
  description?: string;
  from: string;
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
  chain: ChainName;
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
  to: string;
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
