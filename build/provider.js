(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        const misc_1 = require('../utils/misc');
        class RainbowProvider {
          constructor() {
            this.isReady = true;
            this._isConnected = false;
            this._initialized = false;
            this._isUnlocked = true;
            this._callbacks = {};
            this.isMetaMask = true;
            this.isRainbow = true;
            this.networkVersion = '1';
            this.chainId = '0x1';
            this.selectedAddress = undefined;
            this._metamask = {
              isUnlocked: () => {
                return new Promise(resolve => {
                  resolve(this._isUnlocked);
                });
              },
            };
            this.emit = () => {
              return;
            };
            this.on = () => {
              return;
            };
            this.removeAllListeners = () => {
              return;
            };
            this.removeListener = () => {
              return;
            };
            this.request = ({ method, params }) =>
              this._request({ method, params });
            this.isConnected = () => this._isConnected;
            this.enable = () => Promise.resolve();
            this.send = ({ method, params }, callback) =>
              this._request({ method, params }, callback);
            this.sendAsync = ({ method, params }, callback) =>
              this._request({ method, params }, callback);
            this._request = ({ method, params }, cb) => {
              let response = [];
              return new Promise((resolve, reject) => {
                switch (method) {
                  case 'eth_accounts':
                    if (this.isConnected()) {
                      response = [this.selectedAddress];
                    } else {
                      response = [];
                    }
                    console.log('calling method for eth_accounts ', response);
                    break;
                  default:
                    console.log('calling method from request ', {
                      method,
                      params,
                    });
                    this._sendMessage({ method, params }, response => {
                      var _a, _b;
                      console.log('response from request ', response);
                      if (response.error) {
                        reject(response.error);
                      } else {
                        // Store the state of the connection
                        if (
                          method === 'eth_requestAccounts' &&
                          ((_a = response.result) === null || _a === void 0
                            ? void 0
                            : _a.length) > 0
                        ) {
                          this.selectedAddress = response.result[0];
                          this._isConnected = true;
                          // Store the network returned for this dapp
                        } else if (
                          method === 'eth_chainId' &&
                          ((_b = response.result) === null || _b === void 0
                            ? void 0
                            : _b.length) === 0
                        ) {
                          this.chainId = response.result;
                          this.networkVersion = parseInt(
                            this.chainId,
                            16
                          ).toString();
                        }
                        resolve(response.result);
                      }
                    });
                }
              });
              cb === null || cb === void 0 ? void 0 : cb(response);
            };
            this._sendMessage = ({ method, params }, cb) => {
              const id = (0, misc_1.random)();
              this._callbacks[id.toString()] = cb;
              window.postMessage(
                {
                  type: 'TO_RAINBOW_PROVIDER',
                  id,
                  payload: { method, params },
                },
                '*'
              );
            };
          }
        }
        exports.default = RainbowProvider;
      },
      { '../utils/misc': 3 },
    ],
    2: [
      function (require, module, exports) {
        'use strict';
        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const RainbowProvider_1 = __importDefault(
          require('../core/RainbowProvider')
        );
        const provider = new RainbowProvider_1.default();
        window.addEventListener('message', event => {
          if (event.source != window) {
            return;
          }
          if (event.data.type === 'FROM_RAINBOW_PROVIDER') {
            if (event.data.id && provider._callbacks[event.data.id]) {
              provider._callbacks[event.data.id](event.data.payload);
              delete provider._callbacks[event.data.id];
            }
          }
        });
        window.rainbow = true;
        window.ethereum = provider;
        console.log('injection complete in window');
        window.dispatchEvent(new Event('ethereum#initialized'));
      },
      { '../core/RainbowProvider': 1 },
    ],
    3: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        exports.random = void 0;
        function random() {
          const min = 1;
          const max = 1000000;
          return Math.floor(Math.random() * (max - min) + min);
        }
        exports.random = random;
      },
      {},
    ],
  },
  {},
  [2]
);
