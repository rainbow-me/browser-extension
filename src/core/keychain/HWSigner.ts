/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { Address, ByteArray } from 'viem';

import { Messenger, initializeMessenger } from '../messengers';
import { defineReadOnly } from '../utils/define';

import type { HardwareWalletVendor } from './keychainTypes/hardwareWalletKeychain';

export class HWSigner extends Signer {
  readonly path: string | undefined;
  readonly privateKey: null | undefined;
  readonly deviceId: string | undefined;
  readonly address: string | undefined;
  readonly vendor: HardwareWalletVendor;
  readonly messenger: Messenger;
  constructor(
    provider: Provider,
    path: string,
    deviceId: string,
    address: Address,
    vendor: HardwareWalletVendor,
  ) {
    super();
    defineReadOnly(this, 'privateKey', null);
    defineReadOnly(this, 'path', path);
    defineReadOnly(this, 'deviceId', deviceId);
    defineReadOnly(this, 'address', address);
    this.vendor = vendor;
    defineReadOnly(this, 'vendor', vendor);
    defineReadOnly(this, 'provider', provider || null);
    this.messenger = initializeMessenger({ connect: 'popup' });
  }

  async getAddress(): Promise<Address> {
    return this.address as Address;
  }

  async fwdHWSignRequest(action: string, payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.messenger.send('hwRequest', {
        action,
        vendor: this.vendor,
        payload,
      });
      this.messenger.reply(
        'hwResponse',
        async (response: string | { error: string }) => {
          if (typeof response === 'string') {
            resolve(response);
          } else {
            reject('handled');
          }
        },
      );
    });
  }

  async signMessage(message: ByteArray | string): Promise<string> {
    return this.fwdHWSignRequest('signMessage', {
      message,
      address: this.address,
    });
  }

  async signTypedDataMessage(data: any): Promise<string> {
    return this.fwdHWSignRequest('signTypedData', {
      data,
      address: this.address,
    });
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return this.fwdHWSignRequest('signTransaction', transaction);
  }

  connect(provider: Provider): Signer {
    return new HWSigner(
      provider,
      this.path!,
      this.deviceId!,
      this.address! as Address,
      this.vendor!,
    );
  }
}
