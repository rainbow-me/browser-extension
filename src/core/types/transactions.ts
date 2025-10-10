import { TransactionResponse } from '@ethersproject/providers';
import { Address } from 'viem';

import { ParsedAsset, ParsedUserAsset, ProtocolType } from './assets';
import { ChainId } from './chains';
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

  value?: string; // network asset amount sent with the tx (like eth or pol)
  fee?: string;
  lastSubmittedTimestamp?: number;
  native?: {
    // fee and value but in the user prefered currency terms (USD, EUR, etc)
    value?: string;
    fee?: string;
  };
  type: TransactionType;
  typeOverride?: 'speed_up' | 'cancel'; // we keep the tx metadata like type "swap" and add this override to indicate it's a speed up or cancel

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
  explorer?: {
    name: string;
    url: string;
  };
} & Partial<TransactionGasParams & TransactionLegacyGasParams>;

export type PendingTransaction = BaseTransaction & {
  status: 'pending';
};

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
