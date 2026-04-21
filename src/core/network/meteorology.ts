import { createHttpClient } from './internal/createHttpClient';

export const meteorologyHttp = createHttpClient({
  baseUrl: 'https://metadata.s.rainbow.me/meteorology/v1/gas',
  params: {},
});
