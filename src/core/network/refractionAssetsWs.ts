import { createWebSocketClient } from './internal/createWebSocketClient';

export const refractionAssetsWs = createWebSocketClient({
  baseUrl: `${process.env.DATA_ENDPOINT}/assets`,
  headers: { origin: process.env.DATA_ORIGIN || '' },
  query: {
    api_token: process.env.DATA_API_KEY,
  },
});
