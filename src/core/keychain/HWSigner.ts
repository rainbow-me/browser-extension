/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { Address, ByteArray } from 'viem';

import {
  hwRequestPublisher,
  hwResponsePublisher,
} from '../messengers/hwEventPublishers';
import { defineReadOnly } from '../utils/define';

import type { HardwareWalletVendor } from './keychainTypes/hardwareWalletKeychain';

export class HWSigner extends Signer {
  readonly path: string | undefined;
  readonly privateKey: null | undefined;
  readonly deviceId: string | undefined;
  readonly address: string | undefined;
  readonly vendor: HardwareWalletVendor;
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
  }

  async getAddress(): Promise<Address> {
    return this.address as Address;
  }

  async fwdHWSignRequest(
    action: 'signTransaction' | 'signMessage' | 'signTypedData',
    payload: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();

      // Subscribe to the response for this specific request
      const controller = new AbortController();
      const responseSubscription = hwResponsePublisher.subscribe(
        'hw-response',
        {
          signal: controller.signal,
        },
      );

      const handleResponse = async () => {
        for await (const response of responseSubscription) {
          if (response.requestId === requestId) {
            controller.abort(); // once
            if (typeof response.result === 'string') {
              resolve(response.result);
            } else {
              reject(response.result.error || 'Hardware wallet signing failed');
            }
            break;
          }
        }
      };

      // Start listening for the response
      handleResponse().catch(reject);

      // Publish the request
      hwRequestPublisher.publish('hw-request', {
        requestId,
        action: action,
        vendor: this.vendor,
        payload,
      });
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
