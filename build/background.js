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
        chrome.runtime.onInstalled.addListener(() =>
          __awaiter(this, void 0, void 0, function* () {
            // Page we want to show after installation
            const tab = yield chrome.tabs.create({
              url: 'https://rainbow.me/',
            });
            console.log(`Created tab ${tab.id}`);
          })
        );
        const DEFAULT_ACCOUNT = '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4';
        const DEFAULT_CHAIN_ID = '0x1';
        chrome.runtime.onMessage.addListener(function (
          request,
          _,
          sendResponse
        ) {
          try {
            let response = null;
            switch (request.method) {
              case 'eth_chainId':
                response = DEFAULT_CHAIN_ID;
                break;
              case 'eth_requestAccounts':
                response = [DEFAULT_ACCOUNT];
                break;
                break;
            }
            sendResponse({ result: response });
          } catch (e) {
            sendResponse({ result: null, error: e });
          }
        });
      },
      {},
    ],
  },
  {},
  [1]
);
