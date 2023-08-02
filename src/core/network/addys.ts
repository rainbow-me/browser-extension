import { createHttpClient } from './internal/createHttpClient';

export const addysHttp = createHttpClient({
  baseUrl: 'https://addys.p.rainbow.me/v3',
  headers: { Authorization: `Bearer ${process.env.ADDYS_API_KEY}` as string },
});
