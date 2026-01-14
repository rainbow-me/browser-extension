import 'dotenv/config';

import { createServer } from 'prool';
import { anvil } from 'prool/instances';

const NETWORKS = {
  mainnet: {
    chainId: 1337,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
    forkBlockNumber: 24398279,
    blockBaseFeePerGas: 100000000n,
    gasLimit: 30000000n,
  },
  optimism: {
    chainId: 1338,
    forkUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
  },
} as const;

async function main() {
  const network = (process.env.NETWORK as keyof typeof NETWORKS) || 'mainnet';

  const server = createServer({
    instance: anvil(NETWORKS[network], { messageBuffer: 500 }),
    port: 8545,
  });

  await server.start();

  console.log(`Anvil ${network} fork running on http://127.0.0.1:8545`);
  console.log('Press Ctrl+C to stop');

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
