import { createHttpClient } from './internal/createHttpClient';

const PLATFORM_BASE_URL = 'https://platform.p.rainbow.me';

export const platformHttp = createHttpClient({
  baseUrl: PLATFORM_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PLATFORM_API_KEY}` as string,
  },
  timeout: 30_000,
});
