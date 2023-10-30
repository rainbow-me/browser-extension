import { expect, test } from 'vitest';

import { ChainId } from '~/core/types/chains';

import { CustomRPC, customRPCsStore } from '.';

// Dummy CustomRPC data
const TEST_RPC_1: CustomRPC = {
  rpcUrl: 'http://test1.rpc',
  chainId: ChainId.mainnet,
  name: 'Test RPC 1',
  symbol: 'TR1',
  explorer: 'http://test1.explorer',
  active: true,
};

const TEST_RPC_2: CustomRPC = {
  rpcUrl: 'http://test2.rpc',
  chainId: ChainId.mainnet,
  name: 'Test RPC 2',
  symbol: 'TR2',
};

const TEST_RPC_3: CustomRPC = {
  rpcUrl: 'http://test3.rpc',
  chainId: ChainId.optimism,
  name: 'Test RPC 3',
  symbol: 'TR3',
};

// Add
test('should be able to add a new custom RPC', async () => {
  customRPCsStore.getState().addCustomRPC({ customRPC: TEST_RPC_1 });
  const chain = customRPCsStore.getState().customChains[TEST_RPC_1.chainId];
  expect(chain.rpcs).toContainEqual(TEST_RPC_1);
});

test('should be able to add a new custom RPC to a Chain group already created', async () => {
  customRPCsStore.getState().addCustomRPC({ customRPC: TEST_RPC_2 });
  const chain = customRPCsStore.getState().customChains[TEST_RPC_2.chainId];
  expect(chain.rpcs).toContainEqual(TEST_RPC_2);
});

// Update
test('should be able to update an existing custom RPC', async () => {
  const updatedRpc = { ...TEST_RPC_1, name: 'Updated Test RPC 1' };
  customRPCsStore.getState().updateCustomRPC({ customRPC: updatedRpc });

  const chain = customRPCsStore.getState().customChains[TEST_RPC_1.chainId];
  expect(chain.rpcs).toContainEqual(updatedRpc);
  expect(chain.rpcs).toContainEqual(TEST_RPC_2);
});

// Set Active
test('should be able to set a custom RPC as active', async () => {
  customRPCsStore
    .getState()
    .setActiveRPC({ chainId: ChainId.mainnet, rpcUrl: TEST_RPC_1.rpcUrl });

  const chain = customRPCsStore.getState().customChains[ChainId.mainnet];
  expect(chain.activeRpcId).toBe(TEST_RPC_1.rpcUrl);
});

test("should be able to set a custom RPC as active to a different custom RPC in Chain's rpcs", async () => {
  customRPCsStore
    .getState()
    .setActiveRPC({ chainId: ChainId.mainnet, rpcUrl: TEST_RPC_2.rpcUrl });

  const chain = customRPCsStore.getState().customChains[ChainId.mainnet];
  expect(chain.activeRpcId).toBe(TEST_RPC_2.rpcUrl);
});

// Remove
test('should be able to remove an existing custom RPC', async () => {
  customRPCsStore.getState().addCustomRPC({ customRPC: TEST_RPC_3 }); // Add third RPC for removal

  customRPCsStore.getState().removeCustomRPC({ rpcUrl: TEST_RPC_3.rpcUrl });
  const chain = customRPCsStore.getState().customChains[TEST_RPC_3.chainId];
  expect(chain).toBeUndefined();
});

test('should remove activeRpcId if removed RPC was active and change to another RPC if available', async () => {
  customRPCsStore.getState().removeCustomRPC({ rpcUrl: TEST_RPC_2.rpcUrl });

  const chain = customRPCsStore.getState().customChains[ChainId.mainnet];
  expect(chain.activeRpcId).toBe(TEST_RPC_1.rpcUrl);
  expect(chain.rpcs.length).toBe(1);
});

test('should remove the CustomChain if last RPC in it is removed', async () => {
  customRPCsStore.getState().removeCustomRPC({ rpcUrl: TEST_RPC_1.rpcUrl });

  const chain = customRPCsStore.getState().customChains[TEST_RPC_1.chainId];
  expect(chain).toBeUndefined();
});
