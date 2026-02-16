import { Address, Hex } from 'viem';

import { PersonalSignMessage, TypedDataMessage } from './messageSigning';
import { TransactionRequest } from './transactions';

export type HWSigningAction = HWSigningRequest['action'];

export type HWSigningRequest =
  | {
      action: 'signTransaction';
      vendor: 'Ledger' | 'Trezor';
      payload: TransactionRequest;
    }
  | {
      action: 'signMessage';
      vendor: 'Ledger' | 'Trezor';
      payload: { message: PersonalSignMessage; address: Address };
    }
  | {
      action: 'signTypedData';
      vendor: 'Ledger' | 'Trezor';
      payload: { message: TypedDataMessage; address: Address };
    };

export type HWSigningResponse = { signature: Hex } | { error: string };
