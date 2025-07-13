/**
 * @deprecated The Polygon allow list endpoint is deprecated and the client is no longer used.
 */
import { createHttpClient } from './internal/createHttpClient';

export const nftAllowListClient = createHttpClient({
  baseUrl: 'https://metadata.p.rainbow.me/token-list',
});
