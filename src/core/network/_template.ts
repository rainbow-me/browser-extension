import { createHttpClient } from './internal/createHttpClient';
import { createWebSocketClient } from './internal/createWebSocketClient';

export const exampleHttp = createHttpClient({
  baseUrl: 'https://example.com/api',
  // timeout: 10_000,
  // headers: {
  //   'X-Custom-Header': 'foobar'
  // },
});

export const exampleWs = createWebSocketClient({
  baseUrl: 'wss://example.com/ws',
});
