import { createHttpClient } from './internal/createHttpClient';

const headers: Record<string, string> = {
  Authorization: `Bearer ${process.env.ADDYS_API_KEY}`,
};

if (process.env.IS_TESTING === 'true' && process.env.WAF_TOKEN) {
  headers['X-Rainbow-WAF'] = process.env.WAF_TOKEN;
}

export const addysHttp = createHttpClient({
  baseUrl: 'https://addys.p.rainbow.me/v3',
  headers,
});
