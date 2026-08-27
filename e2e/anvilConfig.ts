import 'dotenv/config';

function proxyForkUrl(chainId: number): string {
  const { RPC_PROXY_BASE_URL, RPC_PROXY_API_KEY } = process.env;
  if (!RPC_PROXY_BASE_URL || !RPC_PROXY_API_KEY) {
    throw new Error('RPC_PROXY_BASE_URL / RPC_PROXY_API_KEY missing from .env');
  }
  return `${RPC_PROXY_BASE_URL}/${chainId}/${RPC_PROXY_API_KEY}`;
}

export const NETWORKS = {
  mainnet: {
    chainId: 1337,
    forkUrl: proxyForkUrl(1),
    forkBlockNumber: 24440451, // Updated by fetchResponses.ts
    blockBaseFeePerGas: 100000000n,
    gasLimit: 30000000n,
  },
  optimism: {
    chainId: 1338,
    forkUrl: proxyForkUrl(10),
  },
} as const;
