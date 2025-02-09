import { createHttpClient } from './internal/createHttpClient';

export const trendingTokensHttp = createHttpClient({
  baseUrl: 'https://token-search.rainbow.me/v3/trending/swaps',
  params: {},
});
