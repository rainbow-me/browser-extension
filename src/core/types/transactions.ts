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

export type TxHash = `0x${string}`;

type BaseTransaction = {
  hash: TxHash;
  nonce: number; // -2 when not from the wallet user
  chainId: ChainId;
  from: Address;
  to?: Address; // it may not have a to if it's a contract deployment (covalent)
  data?: string;

  changes?: Array<
    | {
        asset: ParsedUserAsset;
        direction: TransactionDirection;
        address_from?: Address;
        address_to?: Address;
        value?: number | string;
        price?: number | string;
      }
    | undefined
  >;
  direction?: TransactionDirection;
  flashbots?: boolean;

  value?: string; // network asset amount sent with the tx (like eth or matic)
  fee?: string;
  native?: {
    // fee and value but in the user prefered currency terms (USD, EUR, etc)
    value?: string;
    fee?: string;
  };

  type: TransactionType;
  protocol?: ProtocolType;
  title: string;
  description?: string;

  asset?: ParsedAsset; // this is the relevant tx asset, like the asset being sold/approved/withdrawn etc
  approvalAmount?: 'UNLIMITED' | (string & object);
  contract?: {
    name: string;
    iconUrl?: string;
  };

  feeType?: 'legacy' | 'eip-1559';
  gasPrice?: string;
  gasLimit?: string;
  baseFee?: string;
} & Partial<TransactionGasParams & TransactionLegacyGasParams>;

export type PendingTransaction = BaseTransaction & { status: 'pending' };
export type MinedTransaction = BaseTransaction & {
  status: 'confirmed' | 'failed';
  blockNumber: number;
  minedAt: number;
  confirmations: number;
  gasUsed: string;
};

export type RainbowTransaction = PendingTransaction | MinedTransaction;

export type NewTransaction = Omit<PendingTransaction, 'title' | 'changes'> & {
  changes?: Array<
    | {
        direction: TransactionDirection;
        asset: ParsedAsset; // becomes a user asset when the transaction is parsed
        value?: number | string;
        price?: number | string;
      }
    | undefined
  >;
};

const transactionTypes = {
  withoutChanges: [
    'cancel',
    'contract_interaction',
    'deployment',
    'approve',
    'revoke',
    'speed_up',
  ],
  withChanges: [
    'sale',
    'bridge',
    'airdrop',
    'wrap',
    'unwrap',
    'bid',
    'burn',
    'send',
    'receive',
    'withdraw',
    'deposit',
    'mint',
    'swap',
    'borrow',
    'claim',
    'repay',
    'stake',
    'unstake',
    'purchase',
  ],
} as const;

export const isValidTransactionType = (
  type: string | undefined,
): type is TransactionType =>
  !!type &&
  (transactionTypes.withChanges.includes(type) ||
    transactionTypes.withoutChanges.includes(type));

export const transactionTypeShouldHaveChanges = (
  type: TransactionType,
): type is TransactionWithChangesType =>
  transactionTypes.withChanges.includes(type);

type TransactionWithChangesType = (typeof transactionTypes.withChanges)[number];
type TransactionWithoutChangesType =
  (typeof transactionTypes.withoutChanges)[number];

export type TransactionType =
  | TransactionWithChangesType
  | TransactionWithoutChangesType;

export type TransactionDirection = 'in' | 'out' | 'self';

export interface ExecuteRapResponse extends TransactionResponse {
  errorMessage?: string;
}

export type TransactionApiResponse = {
  status: TransactionStatus;
  id: TxHash;
  hash: TxHash;
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
        quantity: string;
        direction: TransactionDirection;
        address_from: Address;
        address_to: Address;
        price: number;
      }
    | undefined
  >;
  fee: {
    value: number;
    price: number;

    // Fee Details are only available on the tx by hash endpoint
    // (won't be available on the consolidated txs list)
    details?: {
      type: 0 | 2;
      type_label: 'legacy' | 'eip-1559';
      gas_price: number;
      gas_limit: number;
      gas_used: number;
      max_fee: number;
      max_priority_fee: number;
      base_fee: number;
      max_base_fee: number;
      rollup_fee_details: {
        l1_fee: number;
        l1_fee_scalar: number;
        l1_gas_price: number;
        l1_gas_used: number;
        l2_fee: number;
      };
    };
  };
  block_confirmations?: number; // also only available on the tx by hash endpoint
  meta: {
    contract_name?: string;
    contract_icon_url?: string;
    type?: TransactionType;
    action?: string;
    asset?: AssetApiResponse;
    quantity?: 'UNLIMITED' | string;
  };
  block_number?: number;
  mined_at?: number;
};

export type PaginatedTransactionsApiResponse = Omit<
  TransactionApiResponse,
  'fee'
> & { fee: Omit<TransactionApiResponse['fee'], 'details'> };
