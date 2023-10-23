import { Ethereum } from '@wagmi/core';
import { EventEmitter } from 'eventemitter3';

import { Messenger } from '../messengers';
import { providerRequestTransport } from '../transports';
import { RPCMethod } from '../types/rpcMethods';
import { getDappHost, isValidUrl } from '../utils/connectedApps';
import { toHex } from '../utils/hex';

export type ChainIdHex = `0x${string}`;

export type RequestArguments = {
  method: RPCMethod;
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
export class RainbowInjectedProvider extends EventEmitter {
  chainId: ChainIdHex = '0x1';
  connected = false;
  isRainbow = true;
  isReady = true;
  isMetaMask = true;
  networkVersion = '1';
  selectedAddress: string | undefined;
  providers: (RainbowInjectedProvider | Ethereum)[] | undefined = undefined;

  #isUnlocked = true;
  requestId = 0;
  rainbowIsDefaultProvider = false;

  [key: string]: unknown;
  backgroundMessenger: Messenger | undefined = undefined;

  constructor({
    messenger,
    backgroundMessenger,
  }: { messenger?: Messenger; backgroundMessenger?: Messenger } = {}) {
    super();

    // RainbowInjectedProvider is also used in popup via RainbowConnector
    // here we don't need to listen to anything so we don't need these listeners
    if (isValidUrl(window.location.href)) {
      this.backgroundMessenger = backgroundMessenger;
      const host = getDappHost(window.location.href);
      messenger?.reply(`accountsChanged:${host}`, async (address) => {
        this.emit('accountsChanged', [address]);
      });
      messenger?.reply(`chainChanged:${host}`, async (chainId: number) => {
        this.emit('chainChanged', toHex(String(chainId)));
      });
      messenger?.reply(`disconnect:${host}`, async () => {
        this.emit('disconnect', []);
      });
      messenger?.reply(`connect:${host}`, async (connectionInfo) => {
        this.emit('connect', connectionInfo);
      });
      messenger?.reply(
        'rainbow_setDefaultProvider',
        async ({ rainbowAsDefault }: { rainbowAsDefault: boolean }) => {
          this.rainbowIsDefaultProvider = rainbowAsDefault;
        },
      );
    }

    // EIP-6963 RainbowInjectedProvider in announceProvider was losing context
    this.bindMethods();
  }

  bindMethods() {
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const value = this[key];
      if (typeof value === 'function' && key !== 'constructor') {
        this[key] = value.bind(this);
      }
    }
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
    this.backgroundMessenger?.send(
      'rainbow_prefetchDappMetadata',
      window.location.href,
    );

    // eslint-disable-next-line no-plusplus
    const id = this.requestId++;
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
    return this.request(args);
  }

  /** @deprecated – This method is deprecated in favor of `request`. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send(
    methodOrPayload: string | RequestArguments,
    paramsOrCallback: Array<unknown>,
  ) {
    if (
      typeof methodOrPayload === 'string' &&
      Array.isArray(paramsOrCallback)
    ) {
      return this.request({
        method: methodOrPayload as RPCMethod,
        params: paramsOrCallback,
      });
    } else {
      return this.request(methodOrPayload as RequestArguments);
    }
  }
}
