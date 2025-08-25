import 'dotenv/config';

import { createServer } from 'prool';
import { anvil } from 'prool/instances';

const NETWORKS = {
  mainnet: {
    chainId: 1337,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
    forkBlockNumber: 21939175,
    blockBaseFeePerGas: 100000000n,
    gasLimit: 30000000n,
  },
  optimism: {
    chainId: 1338,
    forkUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
  },
} as const;

export default async function globalSetup() {
  const network = (process.env.NETWORK as keyof typeof NETWORKS) || 'mainnet';

  const server = createServer({
    instance: anvil(NETWORKS[network]),
    port: 8545,
  });

  await server.start();

  return async () => {
    await server.stop();
  };
}
