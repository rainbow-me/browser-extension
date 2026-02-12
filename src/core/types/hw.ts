import { TransactionRequest } from '@ethersproject/providers';
import { Address, Hex } from 'viem';

import { PersonalSignMessage, TypedDataMessage } from './messageSigning';

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

export type HWSigningResponse = Hex | { error: string };
