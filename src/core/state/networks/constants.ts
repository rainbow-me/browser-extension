import buildTimeNetworks from 'static/data/networks.json';

export const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000; // 2 minutes

export const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;

export { buildTimeNetworks };
