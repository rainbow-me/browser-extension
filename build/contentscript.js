/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/storage.ts
class Storage {
    static set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, function () {
                console.log('Value is set to ' + value);
                resolve();
            });
        });
    }
    static get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, function (result) {
                resolve(result[key]);
            });
        });
    }
}

;// CONCATENATED MODULE: ./src/scripts/contentscript.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

window.addEventListener('message', (event) => {
    if (event.source != window) {
        return;
    }
    if (event.data.type && event.data.type == 'TO_RAINBOW_PROVIDER') {
        // Decide if we can answer or we need to ask the bg based on the RPC method
        switch (event.data.payload.method) {
            default:
                chrome.runtime.sendMessage(event.data.payload, function (response) {
                    window.postMessage({
                        type: 'FROM_RAINBOW_PROVIDER',
                        id: event.data.id,
                        payload: response,
                    }, '*');
                });
        }
    }
}, false);
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
    }
    catch (e) {
        console.log('error injecting provider', e);
    }
}
const init = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const shouldInject = (yield Storage.get('inject')) === true;
        if (shouldInject) {
            injectCode(chrome.runtime.getURL('/provider.js'));
        }
    });
};
init();

/******/ })()
;