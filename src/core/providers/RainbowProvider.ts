import { EventEmitter } from 'eventemitter3';

import { Messenger } from '../messengers';
import { providerRequestTransport } from '../transports';
import { addHexPrefix } from '../utils/ethereum';
import { convertStringToHex } from '../utils/numbers';

export type ChainIdHex = `0x${string}`;

export type RequestArguments = {
  method: string;
  params?: Array<unknown>;
};
export type RequestResponse =
  | {
      id: number;
      error: Error;
      result?: never;
    }
  | {
      id: number;
      error?: never;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any;
    };

/**
 * The provider injected into `window.ethereum`.
 *
 * Reference EIPs:
 * @link https://eips.ethereum.org/EIPS/eip-1193
 * @link https://eips.ethereum.org/EIPS/eip-1102
 */
export class RainbowProvider extends EventEmitter {
  chainId: ChainIdHex = '0x1';
  connected = false;
  isRainbow = true;
  isReady = true;
  isMetaMask = true;
  networkVersion = '1';
  selectedAddress: string | undefined;

  #isUnlocked = true;
  #requestId = 0;

  constructor({ messenger }: { messenger?: Messenger } = {}) {
    super();
    const host = window.location.host;
    messenger?.reply(`accountsChanged:${host}`, async (address) => {
      this.emit('accountsChanged', [address]);
    });
    messenger?.reply(`chainChanged:${host}`, async (chainId: number) => {
      this.emit(
        'chainChanged',
        addHexPrefix(convertStringToHex(String(chainId))),
      );
    });
    messenger?.reply(`disconnect:${host}`, async () => {
      this.emit('disconnect');
    });
    messenger?.reply(`connect:${host}`, async () => {
      this.emit('connect');
    });
  }

  /**
   * @deprecated – This method is deprecated in favor of the RPC method `eth_requestAccounts`.
   * @link https://eips.ethereum.org/EIPS/eip-1102#providerenable-deprecated
   **/
  async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  isConnected() {
    return this.connected;
  }

  async request({
    method,
    params,
  }: RequestArguments): Promise<RequestResponse | undefined> {
    // eslint-disable-next-line no-plusplus
    const id = this.#requestId++;

    const response = await providerRequestTransport.send(
      {
        id,
        method,
        params,
      },
      { id },
    );

    if (response.id !== id) return;
    if (response.error) throw response.error;

    switch (method) {
      case 'eth_requestAccounts': {
        this.selectedAddress = response.result[0];
        this.connected = true;
        break;
      }
      case 'eth_chainId': {
        this.chainId = <ChainIdHex>response.result;
        this.networkVersion = parseInt(this.chainId, 16).toString();
        break;
      }
    }

    return response.result;
  }

  /** @deprecated – This method is deprecated in favor of `request`. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendAsync(args: RequestArguments) {
    // TODO – deprecated, but we still may need it to be compatible with older dapps.
  }

  /** @deprecated – This method is deprecated in favor of `request`. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send(args: RequestArguments) {
    // TODO – deprecated, but we still may need it to be compatible with older dapps.
  }
}
