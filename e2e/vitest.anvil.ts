import 'dotenv/config';

import { createServer } from 'prool';
import { anvil } from 'prool/instances';

const NETWORKS = {
  mainnet: {
    chainId: 1337,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
    forkBlockNumber: 24440451, // Updated by fetchResponses.ts
    blockBaseFeePerGas: 100000000n,
    gasLimit: 30000000n,
  },
  optimism: {
    chainId: 1338,
    forkUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_DEV_KEY}`,
  },
} as const;

// Well-known Hardhat/Anvil default accounts used in E2E tests.
// On recent mainnet forks these addresses may carry EIP-7702 delegation
// bytecode (0xef01…), which causes OpenZeppelin's `_safeMint` to treat them
// as contracts and attempt an `onERC721Received` callback that reverts.
// We clear the code after forking so they behave as plain EOAs.
const TEST_ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0 (SEED_WALLET)
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9 (SWAPS_WALLET)
];

async function clearEip7702Code(port: number): Promise<void> {
  if (typeof fetch === 'undefined') return;
  const url = `http://127.0.0.1:${port}/1`;
  for (const account of TEST_ACCOUNTS) {
    // eslint-disable-next-line no-await-in-loop
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'anvil_setCode',
        params: [account, '0x'],
        id: 1,
      }),
    });
  }
}

export default async function globalSetup() {
  const network = (process.env.NETWORK as keyof typeof NETWORKS) || 'mainnet';

  const server = createServer({
    instance: anvil(NETWORKS[network], { messageBuffer: 500 }),
    port: 8545,
  });

  await server.start();
  await clearEip7702Code(8545);

  return async () => {
    await server.stop();
  };
}
