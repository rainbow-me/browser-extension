import { AssetApiResponse } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { PaginatedTransactionsApiResponse } from '~/core/types/transactions';

/**
 * Metadata for a message from the Zerion API.
 */
interface MessageMeta {
  address?: string;
  currency?: string;
  cut_off?: number;
  status?: string;
  chain_id?: ChainName; // L2
  chain_ids?: ChainId[]; // v3 consolidated
  chain_ids_with_errors?: ChainId[]; // v3 consolidated
  asset_codes?: string;
  next_page_cursor?: string;
}

/**
 * A message from the Zerion API indicating that assets were received.
 */
export interface AddressAssetsReceivedMessage {
  payload?: {
    assets?: {
      asset: AssetApiResponse;
      quantity: string;
      small_balances?: boolean;
    }[];
  };
  meta?: MessageMeta;
}

/**
 * A message from the Zerion API indicating that transaction data was received.
 */
export interface TransactionsReceivedMessage {
  payload?: {
    transactions?: PaginatedTransactionsApiResponse[];
  };
  meta?: MessageMeta;
}
