import { createHttpClient } from './internal/createHttpClient';

export const addysHttp = createHttpClient({
  baseUrl: 'https://addys.p.rainbow.me/v2',
  headers: { Authorization: `Bearer ${process.env.ADDYS_API_KEY}` as string },
});

// instantiating a seperate client temporarily because v3 doesn't support /assets yet
// there may also be a little bit of work moving our v2/assets handlers over to v3 format
export const addysHttpV3 = createHttpClient({
  baseUrl: 'https://addys.p.rainbow.me/v3',
  headers: { Authorization: `Bearer ${process.env.ADDYS_API_KEY}` as string },
});
