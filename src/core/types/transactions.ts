import { BigNumberish } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { Address } from 'wagmi';

import { ETH_ADDRESS } from '../references';

import { ChainId, ChainName, ChainNameDisplay } from './chains';

type BaseTransaction = {
  hash: `0x${string}`;
  nonce: number;
  from: Address;
  to: Address;
  chainId: ChainId;

  type: TransactionType;
  title: string;
  protocol: ProtocolType;
  direction: TransactionDirection;

  data: string;
  value: BigNumberish;
  flashbots: boolean;

  gasLimit: BigNumberish;
  gasPrice: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;

  submittedAt?: number;

  changes?: TransactionsApiResponse['changes'];
};

type PendingTransaction = BaseTransaction & {
  status: 'pending';
};
type ConfirmedTransaction = BaseTransaction & {
  status: 'confirmed';
  blockNumber: number;
  timestamp: number;
};
type FailedTransaction = BaseTransaction & { status: 'failed' };
type DroppedTransaction = BaseTransaction & { status: 'dropped' };
// type CancelledTransaction = BaseTransaction & { status: 'cancelled' };

export type RainbowTransaction =
  | PendingTransaction
  | ConfirmedTransaction
  | FailedTransaction
  | DroppedTransaction;

export type TransactionStatus = RainbowTransaction['status'];
export type NewTransaction = Partial<BaseTransaction>;

export type ProtocolType =
  | 'aave'
  | 'bancor'
  | 'compound'
  | 'curve'
  | 'disperse_app'
  | 'dsr'
  | 'dydx'
  | 'fulcrum'
  | 'iearn'
  | 'kyber'
  | 'maker'
  | 'maker_dss'
  | 'one_inch'
  | 'pool_together'
  | 'ray'
  | 'rainbow'
  | 'set'
  | 'socket'
  | 'synthetix'
  | 'uniswap'
  | 'zrx_stacking'
  | 'zrx_staking';

export type TransactionType =
  | 'approve'
  | 'bridge'
  | 'borrow'
  | 'cancel'
  | 'contract interaction'
  | 'deployment'
  | 'deposit'
  | 'purchase'
  | 'receive'
  | 'repay'
  | 'send'
  | 'swap'
  | 'withdraw';

export type TransactionDirection = 'in' | 'out' | 'self';

export interface ExecuteRapResponse extends TransactionResponse {
  errorMessage?: string;
}

type ApiAsset = {
  asset_code: AddressOrEth;
  decimals: number;
  icon_url: string;
  name: typeof ChainNameDisplay[ChainId];
  network: ChainName;
  price: {
    value: number;
    changed_at: number;
    relative_change_24h: number;
  };
  symbol: string;
  colors: { primary: string; fallback: string };
  networks: {
    [chainId in ChainId]?: {
      address: chainId extends ChainId.mainnet ? AddressOrEth : Address;
      decimals: number;
    };
  };
};

export type TransactionsApiResponse = {
  id: `0x${string}`;
  hash: `0x${string}`;
  type:
    | 'authorize'
    | 'borrow'
    | 'cancel'
    | 'contract interaction'
    | 'deployment'
    | 'deposit'
    | 'dropped'
    | 'execution'
    | 'receive'
    | 'repay'
    | 'send'
    | 'trade'
    | 'withdraw';
  network: ChainName;
  block_number: number;
  mined_at: number;
  protocol: ProtocolType;
  status: 'confirmed' | 'failed' | 'pending';
  direction: TransactionDirection;
  address_from: Address;
  address_to: Address;
  nonce: number;
  changes: Array<{
    asset: ApiAsset;
    value: number;
    direction: TransactionDirection;
    address_from: Address;
    address_to: Address;
    price: number;
  }>;
  fee: { value: number; price: number };
  meta: {
    contract_name: string;
    type: TransactionType;
    action: string;
    contract_icon_url: string;
    asset: ApiAsset;
  };
};

type AddressOrEth = Address | typeof ETH_ADDRESS;
