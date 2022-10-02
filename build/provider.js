/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/misc.ts
function random() {
    const min = 1;
    const max = 1000000;
    return Math.floor(Math.random() * (max - min) + min);
}

;// CONCATENATED MODULE: ./src/core/RainbowProvider.ts

class RainbowProvider {
    constructor() {
        Object.defineProperty(this, "isReady", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isUnlocked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "isMetaMask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "isRainbow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "networkVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '1'
        });
        Object.defineProperty(this, "chainId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '0x1'
        });
        Object.defineProperty(this, "selectedAddress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        Object.defineProperty(this, "_metamask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                isUnlocked: () => {
                    return new Promise((resolve) => {
                        resolve(this._isUnlocked);
                    });
                },
            }
        });
        Object.defineProperty(this, "emit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                return;
            }
        });
        Object.defineProperty(this, "on", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                return;
            }
        });
        Object.defineProperty(this, "removeAllListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                return;
            }
        });
        Object.defineProperty(this, "removeListener", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                return;
            }
        });
        Object.defineProperty(this, "request", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ method, params }) => this._request({ method, params })
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this._isConnected
        });
        Object.defineProperty(this, "enable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => Promise.resolve()
        });
        Object.defineProperty(this, "send", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ method, params }, callback) => this._request({ method, params }, callback)
        });
        Object.defineProperty(this, "sendAsync", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ method, params }, callback) => this._request({ method, params }, callback)
        });
        Object.defineProperty(this, "_request", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ method, params }, cb) => {
                let response = [];
                return new Promise((resolve, reject) => {
                    switch (method) {
                        case 'eth_accounts':
                            if (this.isConnected() && this.selectedAddress) {
                                response = [this.selectedAddress];
                            }
                            else {
                                response = [];
                            }
                            console.log('calling method for eth_accounts ', response);
                            break;
                        default:
                            console.log('calling method from request ', { method, params });
                            this._sendMessage({ method, params }, (response) => {
                                var _a, _b;
                                console.log('response from request ', response);
                                if (response.error) {
                                    reject(response.error);
                                }
                                else {
                                    // Store the state of the connection
                                    if (method === 'eth_requestAccounts' &&
                                        ((_a = response.result) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                                        this.selectedAddress = response.result[0];
                                        this._isConnected = true;
                                        // Store the network returned for this dapp
                                    }
                                    else if (method === 'eth_chainId' &&
                                        ((_b = response.result) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                                        this.chainId = response.result;
                                        this.networkVersion = parseInt(this.chainId, 16).toString();
                                    }
                                    resolve(response.result);
                                }
                            });
                    }
                });
                cb === null || cb === void 0 ? void 0 : cb(response);
            }
        });
        Object.defineProperty(this, "_sendMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ method, params }, cb) => {
                const id = random();
                if (cb)
                    this._callbacks[id.toString()] = cb;
                window.postMessage({ type: 'TO_RAINBOW_PROVIDER', id, payload: { method, params } }, '*');
            }
        });
    }
}

;// CONCATENATED MODULE: ./src/scripts/provider.ts

const provider = new RainbowProvider();
window.addEventListener('message', (event) => {
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

/******/ })()
;