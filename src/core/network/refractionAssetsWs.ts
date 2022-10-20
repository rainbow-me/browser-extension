import { createWebSocketClient } from './internal/createWebSocketClient';

export const refractionAssetsMessages = {
  ASSET_INFO: {
    RECEIVED: 'received assets info',
  },
  ASSETS: {
    CHANGED: 'changed assets prices',
    RECEIVED: 'received assets prices',
  },
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MAINNET_ASSET_DISCOVERY: 'received address mainnet-assets-discovery',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
};

export const refractionAssetsWs = createWebSocketClient({
  baseUrl: `${process.env.DATA_ENDPOINT}/assets`,
  headers: { origin: process.env.DATA_ORIGIN || '' },
  query: {
    api_token: process.env.DATA_API_KEY,
  },
});
