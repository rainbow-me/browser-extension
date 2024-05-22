/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Bytes } from '@ethersproject/bytes';
import { defineReadOnly } from '@ethersproject/properties';
import { Provider } from '@ethersproject/providers';
import { Address } from 'viem';

import { initializeMessenger } from '../messengers';

export class HWSigner extends Signer {
  readonly path: string | undefined;
  readonly privateKey: null | undefined;
  readonly deviceId: string | undefined;
  readonly address: string | undefined;
  readonly vendor: string | undefined;
  readonly messenger: any | undefined;

  constructor(
    provider: Provider,
    path: string,
    deviceId: string,
    address: Address,
    vendor: string,
  ) {
    super();
    defineReadOnly(this, 'privateKey', null);
    defineReadOnly(this, 'path', path);
    defineReadOnly(this, 'deviceId', deviceId);
    defineReadOnly(this, 'address', address);
    defineReadOnly(this, 'vendor', vendor);
    defineReadOnly(this, 'provider', provider || null);
    const popupMessenger = initializeMessenger({ connect: 'popup' });
    defineReadOnly(this, 'messenger', popupMessenger);
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

  async signMessage(message: Bytes | string): Promise<string> {
    return this.fwdHWSignRequest('signMessage', {
      message,
      address: this.address,
    });
  }

  async signTypedDataMessage(data: any): Promise<string> {
    return this.fwdHWSignRequest('signTypedDataMessage', {
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
