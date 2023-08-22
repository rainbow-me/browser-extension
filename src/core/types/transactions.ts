import { BigNumberish } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { Address } from 'wagmi';

import { ParsedUserAsset } from '../utils/assets';

import { AddressOrEth, ParsedAsset } from './assets';
import { ChainId, ChainName } from './chains';

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'dropped';

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

  // asset?: ParsedAsset;
  // value?: string;

  blockNumber?: number;
  minedAt?: number;
};

// type DroppedTransaction = BaseTransaction & { status: 'dropped' };
// type CancelledTransaction = BaseTransaction & { status: 'cancelled' };

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type RainbowTransaction = BaseTransaction;
// | ({
//     type: Exclude<TransactionType, 'swap' | 'wrap' | 'unwrap'>;
//   } & BaseTransaction)
// | ({ type: 'swap' | 'wrap' | 'unwrap' } & WithRequired<
//     BaseTransaction,
//     'changes'
//   >);

export type NewTransaction = WithRequired<
  Omit<BaseTransaction, 'title' | 'changes'>,
  'from' | 'nonce' | 'data'
> & {
  changes: Array<
    | {
        asset: ParsedAsset;
        direction: TransactionDirection;
        value: number | string;
      }
    | undefined
  >;
};

// protocols https://github.com/rainbow-me/go-utils-lib/blob/master/pkg/enums/token_type.go#L44
export type ProtocolType =
  | 'aave-v2'
  | 'balancer'
  | 'curve'
  | 'compound'
  | 'compound-v3'
  | 'maker'
  | 'one-inch'
  | 'piedao-pool'
  | 'yearn'
  | 'yearn-v2'
  | 'uniswap-v2'
  | 'aave-v3'
  | 'harvest'
  | 'lido'
  | 'uniswap-v3'
  | 'convex'
  | 'convex-frax'
  | 'pancake-swap'
  | 'balancer-v2'
  | 'frax'
  | 'gmx'
  | 'aura'
  | 'pickle'
  | 'yearn-v3'
  | 'venus'
  | 'sushiswap';

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

// export const TransactionOutTypes = [
//   'burn',
//   'send',
//   'deposit',
//   'repay',
//   'stake',
//   'sale',
//   'bridge',
//   'bid',
//   'speed_up',
//   'revoke',
//   'deployment',
//   'contract_interaction',
// ] as const;

// export const TransactionInTypes = [
//   'receive',
//   'withdraw',
//   'mint',
//   'borrow',
//   'claim',
//   'unstake',
//   'purchase',
//   'airdrop',
//   'wrap',
//   'unwrap',
//   'approve',
//   'swap',
//   'cancel',
// ] as const;

export type TransactionDirection = 'in' | 'out' | 'self';

export interface ExecuteRapResponse extends TransactionResponse {
  errorMessage?: string;
}

export type AssetApiResponse = {
  asset_code: AddressOrEth;
  decimals: number;
  icon_url: string;
  name: string;
  price: {
    value: number;
    changed_at: number;
    relative_change_24h: number;
  };
  symbol: string;
  colors?: { primary?: string; fallback?: string; shadow?: string };
  network?: ChainName;
  networks?: {
    [chainId in ChainId]?: {
      address: chainId extends ChainId.mainnet ? AddressOrEth : Address;
      decimals: number;
    };
  };
  type?: ProtocolType | 'nft';
};

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
        value: number;
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
