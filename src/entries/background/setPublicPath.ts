declare let __webpack_public_path__: string;

declare const __webpack_require__: {
  p: string;
  u: (chunkId: string) => string;
};

if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
  // Ensure chunk URLs resolve to extension origin in MV3 service worker.
  const getUrl = chrome.runtime.getURL;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __webpack_public_path__ = getUrl('');

  if (typeof __webpack_require__ !== 'undefined') {
    const originalU = __webpack_require__.u.bind(__webpack_require__);
    __webpack_require__.p = '';
    __webpack_require__.u = (chunkId: string) => getUrl(originalU(chunkId));
  }
}
