import { createServer } from 'prool';
import { anvil } from 'prool/instances';

import { NETWORKS } from './anvilConfig';

// Well-known Hardhat/Anvil default accounts used in E2E tests.
// On recent mainnet forks these addresses may carry EIP-7702 delegation
// bytecode (0xef01…), which causes OpenZeppelin's `_safeMint` to treat them
// as contracts and attempt an `onERC721Received` callback that reverts.
// We clear the code after forking so they behave as plain EOAs.
// Covers full default mnemonic set (test test test... junk) for network list.
const TEST_ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0 (SEED_WALLET)
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account #3
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Account #4
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // Account #5
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Account #6
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Account #7
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', // Account #8
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9 (SWAPS_WALLET)
];

async function clearEip7702Code(port: number): Promise<void> {
  if (typeof fetch === 'undefined') return;
  const url = `http://127.0.0.1:${port}/1`;

  await Promise.allSettled(
    TEST_ACCOUNTS.map((account) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'anvil_setCode',
          params: [account, '0x'],
          id: 1,
        }),
      }),
    ),
  );
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
