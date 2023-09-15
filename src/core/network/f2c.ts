import { createHttpClient } from './internal/createHttpClient';

const IS_DEV = process.env.IS_DEV === 'true';

const STAGING_HOST = `https://f2c.rainbowdotme.workers.dev`;
const PROD_HOST = `https://f2c.rainbow.me`;

export const f2cHttp = createHttpClient({
  baseUrl: IS_DEV ? STAGING_HOST : PROD_HOST,
});
