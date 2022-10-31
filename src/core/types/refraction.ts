import { ZerionAsset } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { ZerionTransaction } from '~/core/types/transactions';

/**
 * Metadata for a message from the Zerion API.
 */
export interface MessageMeta {
  address?: string;
  currency?: string;
  status?: string;
  chain_id?: ChainName; // L2
}

/**
 * A message from the Zerion API indicating that assets were received.
 */
export interface AddressAssetsReceivedMessage {
  payload?: {
    assets?: {
      [id: string]: {
        asset: ZerionAsset;
        quantity: string;
      };
    };
  };
  meta?: MessageMeta;
}

/**
 * A message from the Zerion API indicating that transaction data was received.
 */
export interface TransactionsReceivedMessage {
  payload?: {
    transactions?: ZerionTransaction[];
  };
  meta?: MessageMeta;
}

/**
 * A message from the Zerion API indicating that asset price data was received
 */
export interface AssetPricesReceivedMessage {
  payload?: {
    prices?: {
      [id: string]: ZerionAsset;
    };
  };
  meta?: MessageMeta;
}
