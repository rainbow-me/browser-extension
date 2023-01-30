import { createHttpClient } from './internal/createHttpClient';

export const tokenSearchHttp = createHttpClient({
  baseUrl: 'https://token-search.rainbow.me/v2',
  params: {},
});
