import { BigNumberish } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { Address } from 'wagmi';

import { ParsedUserAsset } from '../utils/assets';

import { AssetApiResponse, ParsedAsset, ProtocolType } from './assets';
import { ChainId, ChainName } from './chains';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
// | 'cancelled'
// | 'dropped';

type BaseTransaction = {
  status: TransactionStatus;
  hash: `0x${string}`;
  nonce: number; // -2 when not from the wallet user
  chainId: ChainId;

  from: Address;
  to?: Address; // it may not have a to if it's a contract deployment (covalent)

  type: TransactionType;
  title: string;
  protocol?: ProtocolType;
  name?: string;
  description?: string;

  data?: string;
  flashbots?: boolean;

  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;

  submittedAt?: number;

  changes: Array<
    | {
        asset: ParsedUserAsset;
        direction: TransactionDirection;
        address_from?: Address;
        address_to?: Address;
        value: number | string;
        price?: number;
      }
    | undefined
  >;
  direction?: TransactionDirection;

  value?: string; // ETH value
  asset: ParsedAsset;

  blockNumber: number;
  minedAt: number;
};

type ConfirmedTransaction = BaseTransaction & { status: 'confirmed' };
type PendingTransaction = Omit<BaseTransaction, 'blockNumber' | 'minedAt'> & {
  status: 'pending';
  blockNumber?: number;
  minedAt?: number;
};
type FailedTransaction = BaseTransaction & { status: 'failed' };

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type RainbowTransaction =
  | ConfirmedTransaction
  | PendingTransaction
  | FailedTransaction;

// | DroppedTransaction
// | CancelledTransaction;
// | ({
//     type: Exclude<TransactionType, 'swap' | 'wrap' | 'unwrap'>;
//   } & BaseTransaction)
// | ({ type: 'swap' | 'wrap' | 'unwrap' } & WithRequired<
//     BaseTransaction,
//     'changes'
//   >);

export type NewTransaction = Omit<BaseTransaction, 'title' | 'changes'> & {
  changes: Array<
    | {
        asset?: ParsedAsset | null;
        direction: TransactionDirection;
        value: number | string;
      }
    | undefined
  >;
};

export type TransactionType =
  | 'burn'
  | 'cancel'
  | 'send'
  | 'receive'
  | 'withdraw'
  | 'deposit'
  | 'mint'
  | 'contract_interaction'
  | 'swap'
  | 'borrow'
  | 'claim'
  | 'deployment'
  | 'repay'
  | 'stake'
  | 'unstake'
  | 'purchase'
  | 'approve'
  | 'revoke'
  | 'sale'
  | 'bridge'
  | 'airdrop'
  | 'wrap'
  | 'unwrap'
  | 'bid'
  | 'speed_up';

export type TransactionDirection = 'in' | 'out' | 'self';

export interface ExecuteRapResponse extends TransactionResponse {
  errorMessage?: string;
}

export type TransactionsApiResponse = {
  id: `0x${string}`;
  hash: `0x${string}`;
  network: ChainName;
  protocol?: ProtocolType;
  direction?: TransactionDirection;
  address_from?: Address;
  address_to?: Address;
  // nonce will ALWAYS be -2 when the transaction is *not* from the wallet user
  nonce: number;
  changes: Array<
    | {
        asset: AssetApiResponse;
        value: number | null;
        direction: TransactionDirection;
        address_from: Address;
        address_to: Address;
        price: number;
      }
    | undefined
  >;
  fee: { value: number; price: number };
  meta: {
    contract_name?: string;
    type?: TransactionType;
    action?: string;
    contract_icon_url?: string;
    asset?: AssetApiResponse;
  };
} & (
  | {
      status: 'confirmed';
      block_number: number;
      mined_at: number;
    }
  | {
      status: 'failed' | 'pending';
    }
);
