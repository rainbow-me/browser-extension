import buildTimeNetworks from 'static/data/networks.json';

export const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000; // 2 minutes

export const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;
export const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
export const IS_DEV = process.env.IS_DEV === 'true';
export const IS_TESTING = process.env.IS_TESTING === 'true';

export { buildTimeNetworks };
