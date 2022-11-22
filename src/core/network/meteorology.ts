import { createHttpClient } from './internal/createHttpClient';

export const meteorologyHttp = createHttpClient({
  baseUrl: 'https://metadata.p.rainbow.me/meteorology/v1/gas',
  params: {},
});
