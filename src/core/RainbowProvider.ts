import { random } from '~/utils/misc';

type CallbackFunctionWithArgs = (...args: any[]) => void;

export class RainbowProvider {
  isReady = true;
  _isConnected = false;
  _initialized = false;
  _isUnlocked = true;
  _callbacks: Record<string, CallbackFunctionWithArgs> = {};
  isMetaMask = true;
  isRainbow = true;
  networkVersion = '1';
  chainId = '0x1';
  selectedAddress: string | undefined = undefined;
  _metamask = {
    isUnlocked: () => {
      return new Promise((resolve) => {
        resolve(this._isUnlocked);
      });
    },
  };
  emit = () => {
    return;
  };
  on = () => {
    return;
  };
  removeAllListeners = () => {
    return;
  };
  removeListener = () => {
    return;
  };
  request = ({ method, params }: { method: string; params: object }) =>
    this._request({ method, params });
  isConnected = () => this._isConnected;
  enable = () => Promise.resolve();
  send = (
    { method, params }: { method: string; params: object },
    callback: CallbackFunctionWithArgs,
  ) => this._request({ method, params }, callback);
  sendAsync = (
    { method, params }: { method: string; params: object },
    callback: CallbackFunctionWithArgs,
  ) => this._request({ method, params }, callback);
  _request = (
    { method, params }: { method: string; params: object },
    cb?: CallbackFunctionWithArgs,
  ) => {
    let response: Array<string> = [];
    return new Promise((resolve, reject) => {
      switch (method) {
        case 'eth_accounts':
          if (this.isConnected() && this.selectedAddress) {
            response = [this.selectedAddress];
          } else {
            response = [];
          }
          console.log('calling method for eth_accounts ', response);

          break;

        default:
          console.log('calling method from request ', { method, params });
          this._sendMessage(
            { method, params },
            (response: { error: Error; result: Array<string> | string }) => {
              console.log('response from request ', response);
              if (response.error) {
                reject(response.error);
              } else {
                // Store the state of the connection
                if (
                  method === 'eth_requestAccounts' &&
                  response.result?.length > 0
                ) {
                  this.selectedAddress = response.result[0];
                  this._isConnected = true;
                  // Store the network returned for this dapp
                } else if (
                  method === 'eth_chainId' &&
                  response.result?.length === 0
                ) {
                  this.chainId = response.result as string;
                  this.networkVersion = parseInt(this.chainId, 16).toString();
                }
                resolve(response.result);
              }
            },
          );
      }
    });
    cb?.(response);
  };

  _sendMessage = (
    { method, params }: { method: string; params: object },
    cb?: CallbackFunctionWithArgs,
  ) => {
    const id = random();
    if (cb) this._callbacks[id.toString()] = cb;
    window.postMessage(
      { type: 'TO_RAINBOW_PROVIDER', id, payload: { method, params } },
      '*',
    );
  };
}
