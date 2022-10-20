import { createHttpClient } from './internal/createHttpClient';

export const etherscanHttp = createHttpClient({
  baseUrl: 'https://api.etherscan.io/api',
  params: {
    apikey: process.env.ETHERSCAN_API_KEY,
  },
});
