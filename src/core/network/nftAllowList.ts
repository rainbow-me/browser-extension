import { createHttpClient } from './internal/createHttpClient';

export const nftAllowListClient = createHttpClient({
  baseUrl: 'https://metadata.p.rainbow.me/token-list',
});
