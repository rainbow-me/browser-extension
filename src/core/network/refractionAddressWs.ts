import { createWebSocketClient } from './internal/createWebSocketClient';

export const refractionAddressWs = createWebSocketClient({
  baseUrl: `${process.env.DATA_ENDPOINT}/address`,
  headers: { origin: process.env.DATA_ORIGIN || '' },
  query: {
    api_token: process.env.DATA_API_KEY,
  },
});
