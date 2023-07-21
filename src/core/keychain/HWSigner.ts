/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { Address } from 'wagmi';

import { initializeMessenger } from '../messengers';

export class HWSigner extends ethers.Signer {
  readonly path: string | undefined;
  readonly privateKey: null | undefined;
  readonly deviceId: string | undefined;
  readonly address: string | undefined;
  readonly vendor: string | undefined;
  readonly messenger: any | undefined;

  constructor(
    provider: ethers.providers.Provider,
    path: string,
    deviceId: string,
    address: Address,
    vendor: string,
  ) {
    super();
    ethers.utils.defineReadOnly(this, 'privateKey', null);
    ethers.utils.defineReadOnly(this, 'path', path);
    ethers.utils.defineReadOnly(this, 'deviceId', deviceId);
    ethers.utils.defineReadOnly(this, 'address', address);
    ethers.utils.defineReadOnly(this, 'vendor', vendor);
    ethers.utils.defineReadOnly(this, 'provider', provider || null);
    const popupMessenger = initializeMessenger({ connect: 'popup' });
    ethers.utils.defineReadOnly(this, 'messenger', popupMessenger);
  }

  async getAddress(): Promise<string> {
    return this.address as string;
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

  async signMessage(message: ethers.utils.Bytes | string): Promise<string> {
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

  async signTransaction(
    transaction: ethers.providers.TransactionRequest,
  ): Promise<string> {
    return this.fwdHWSignRequest('signTransaction', transaction);
  }

  connect(provider: ethers.providers.Provider): ethers.Signer {
    return new HWSigner(
      provider,
      this.path!,
      this.deviceId!,
      this.address! as Address,
      this.vendor!,
    );
  }
}
