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
        var __awaiter =
          (this && this.__awaiter) ||
          function (thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                  });
            }
            return new (P || (P = Promise))(function (resolve, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator['throw'](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done
                  ? resolve(result.value)
                  : adopt(result.value).then(fulfilled, rejected);
              }
              step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
              );
            });
          };
        var __importDefault =
          (this && this.__importDefault) ||
          function (mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          };
        Object.defineProperty(exports, '__esModule', { value: true });
        const storage_1 = __importDefault(require('../utils/storage'));
        window.addEventListener(
          'message',
          event => {
            if (event.source != window) {
              return;
            }
            if (event.data.type && event.data.type == 'TO_RAINBOW_PROVIDER') {
              // Decide if we can answer or we need to ask the bg based on the RPC method
              switch (event.data.payload.method) {
                default:
                  chrome.runtime.sendMessage(
                    event.data.payload,
                    function (response) {
                      window.postMessage(
                        {
                          type: 'FROM_RAINBOW_PROVIDER',
                          id: event.data.id,
                          payload: response,
                        },
                        '*'
                      );
                    }
                  );
              }
            }
          },
          false
        );
        function injectCode(src) {
          const script = document.createElement('script');
          script.src = src;
          script.onload = function () {
            console.log('rainbow inpage script injected');
            console.log('OKKKK');
            script.remove();
          };
          try {
            (document.head || document.documentElement).appendChild(script);
          } catch (e) {
            console.log('error injecting provider', e);
          }
        }
        const init = function () {
          return __awaiter(this, void 0, void 0, function* () {
            const shouldInject =
              (yield storage_1.default.get('inject')) === true;
            if (shouldInject) {
              injectCode(chrome.runtime.getURL('/provider.js'));
            }
          });
        };
        init();
      },
      { '../utils/storage': 2 },
    ],
    2: [
      function (require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: true });
        class Storage {
          static set(key, value) {
            return new Promise(resolve => {
              chrome.storage.local.set({ [key]: value }, function () {
                console.log('Value is set to ' + value);
                resolve();
              });
            });
          }
          static get(key) {
            return new Promise(resolve => {
              chrome.storage.local.get(key, function (result) {
                resolve(result[key]);
              });
            });
          }
        }
        exports.default = Storage;
      },
      {},
    ],
  },
  {},
  [1]
);
