import { TransactionResponse } from '@ethersproject/providers';
import { Address } from 'wagmi';

import {
  AssetApiResponse,
  ParsedAsset,
  ParsedUserAsset,
  ProtocolType,
} from './assets';
import { ChainId, ChainName } from './chains';
import { TransactionGasParams, TransactionLegacyGasParams } from './gas';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
// | 'cancelled'
// | 'dropped';

type BaseTransaction = {
  hash: `0x${string}`;
  nonce: number; // -2 when not from the wallet user
  chainId: ChainId;

  from: Address;
  to?: Address; // it may not have a to if it's a contract deployment (covalent)

  type: TransactionType;
  protocol?: ProtocolType;
  title: string;
  description?: string;

  data?: string;
  flashbots?: boolean;

  changes: Array<
    | {
        asset: ParsedUserAsset;
        direction: TransactionDirection;
        address_from?: Address;
        address_to?: Address;
        value?: number;
        price?: number;
      }
    | undefined
  >;
  direction?: TransactionDirection;

  value?: string; // native asset value (eth)
  asset?: ParsedAsset;
} & Partial<TransactionGasParams & TransactionLegacyGasParams>;

type PendingTransaction = BaseTransaction & { status: 'pending' };
type MinedTransaction = BaseTransaction & {
  status: 'confirmed' | 'failed';
  blockNumber: number;
  minedAt: number;
};

export type RainbowTransaction = PendingTransaction | MinedTransaction;

export type NewTransaction = Omit<PendingTransaction, 'title'>;

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

export type TransactionApiResponse<
  Status extends TransactionStatus = TransactionStatus,
> = {
  status: Status;
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
  block_number: Status extends 'pending' ? undefined : number;
  mined_at: Status extends 'pending' ? undefined : number;
};

export type PaginatedTransactionsApiResponse =
  | TransactionApiResponse<'pending'>
  | TransactionApiResponse<'confirmed'>
  | TransactionApiResponse<'failed'>;
