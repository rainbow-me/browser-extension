import { createHttpClient } from './internal/createHttpClient';

export const ahaHttp = createHttpClient({
  baseUrl: 'https://aha.rainbow.me',
});
