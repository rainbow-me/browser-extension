/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { Address, TypedDataDefinition } from 'viem';

import { Messenger, initializeMessenger } from '../messengers';
import {
  HWSigningAction,
  HWSigningRequest,
  HWSigningResponse,
} from '../types/hw';
import { PersonalSignMessage, TypedDataMessage } from '../types/messageSigning';
import { defineReadOnly } from '../utils/define';

import type { HardwareWalletVendor } from './keychainTypes/hardwareWalletKeychain';

export class HWSigner extends Signer {
  readonly path: string | undefined;
  readonly privateKey: null | undefined;
  readonly deviceId: string | undefined;
  readonly address: Address | undefined;
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
    if (!this.address) {
      throw new Error('Address not available');
    }
    return this.address;
  }

  async fwdHWSignRequest<TAction extends HWSigningAction>(
    action: TAction,
    payload: Extract<HWSigningRequest, { action: TAction }>['payload'],
  ): Promise<string> {
    const response = await this.messenger.send<
      HWSigningRequest,
      HWSigningResponse
    >('hwRequest', {
      action,
      vendor: this.vendor,
      payload,
    } as HWSigningRequest);

    if ('signature' in response) {
      return response.signature;
    } else if ('error' in response) {
      throw new Error(response.error);
    } else {
      throw new Error('Hardware wallet signing failed');
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.address) {
      throw new Error('Address not available');
    }
    const personalSignMessage: PersonalSignMessage = {
      type: 'personal_sign',
      message,
    };
    return this.fwdHWSignRequest('signMessage', {
      message: personalSignMessage,
      address: this.address,
    });
  }

  async signTypedDataMessage<TTypedData extends TypedDataDefinition>(
    data: TTypedData,
  ): Promise<string> {
    if (!this.address) {
      throw new Error('Address not available');
    }
    const typedDataMessage: TypedDataMessage<TTypedData> = {
      type: 'sign_typed_data',
      data,
    };
    return this.fwdHWSignRequest('signTypedData', {
      message: typedDataMessage,
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
      this.address!,
      this.vendor!,
    );
  }
}
