import 'dotenv/config';

export const NETWORKS = {
  mainnet: {
    chainId: 1337,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
    forkBlockNumber: 24549487, // Updated by fetchResponses.ts
    blockBaseFeePerGas: 100000000n,
    gasLimit: 30000000n,
  },
  optimism: {
    chainId: 1338,
    forkUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
  },
} as const;
