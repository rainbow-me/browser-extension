import { Chain } from 'viem';
import { celo, fantom } from 'viem/chains';
import { expect, test } from 'vitest';

import { rainbowChainsStore } from '.';

// Dummy CustomChain data
const TEST_RPC_1: Chain = {
  rpcUrls: {
    default: { http: ['http://test1.rpc'] },
    public: { http: ['http://test1.rpc'] },
  },
  id: fantom.id,
  name: 'Test RPC 1',
  nativeCurrency: {
    name: 'TR1',
    symbol: 'TR1',
    decimals: 18,
  },
  blockExplorers: {
    default: { name: '', url: 'http://test1.explorer' },
  },
};

const TEST_RPC_2: Chain = {
  rpcUrls: {
    default: { http: ['http://test2.rpc'] },
    public: { http: ['http://test2.rpc'] },
  },
  id: fantom.id,
  name: 'Test RPC 2',
  nativeCurrency: {
    name: 'TR2',
    symbol: 'TR2',
    decimals: 18,
  },
  blockExplorers: {
    default: { name: '', url: 'http://test2.explorer' },
  },
};

const TEST_RPC_3: Chain = {
  rpcUrls: {
    default: { http: ['http://test3.rpc'] },
    public: { http: ['http://test3.rpc'] },
  },
  id: celo.id,
  name: 'Test RPC 3',
  nativeCurrency: {
    name: 'TR3',
    symbol: 'TR3',
    decimals: 18,
  },
  blockExplorers: {
    default: { name: '', url: 'http://test3.explorer' },
  },
};

// Add
test('should be able to add a new custom RPC', async () => {
  rainbowChainsStore.getState().addCustomRPC({ chain: TEST_RPC_1 });
  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_1.id];
  expect(chain.chains).toContainEqual(TEST_RPC_1);
});

test('should not be able to add a repeated custom RPC', async () => {
  rainbowChainsStore.getState().addCustomRPC({ chain: TEST_RPC_1 });
  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_1.id];
  expect(chain.chains).toEqual([TEST_RPC_1]);
});

test('should be able to add a new custom RPC to a Chain group already created', async () => {
  rainbowChainsStore.getState().addCustomRPC({ chain: TEST_RPC_2 });
  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_2.id];
  expect(chain.chains).toContainEqual(TEST_RPC_2);
});

// Update
test('should be able to update an existing custom RPC', async () => {
  const updatedRpc = { ...TEST_RPC_1, name: 'Updated Test RPC 1' };
  rainbowChainsStore.getState().updateCustomRPC({ chain: updatedRpc });

  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_1.id];
  expect(chain.chains).toContainEqual(updatedRpc);
  expect(chain.chains).toContainEqual(TEST_RPC_2);
});

// Set Active
test('should be able to set a custom RPC as active', async () => {
  rainbowChainsStore.getState().setActiveRPC({
    chainId: fantom.id,
    rpcUrl: TEST_RPC_1.rpcUrls.default.http[0],
  });

  const chain = rainbowChainsStore.getState().rainbowChains[fantom.id];
  expect(chain.activeRpcUrl).toBe(TEST_RPC_1.rpcUrls.default.http[0]);
});

test("should be able to set a custom RPC as active to a different custom RPC in Chain's rpcs", async () => {
  rainbowChainsStore.getState().setActiveRPC({
    chainId: fantom.id,
    rpcUrl: TEST_RPC_2.rpcUrls.default.http[0],
  });

  const chain = rainbowChainsStore.getState().rainbowChains[fantom.id];
  expect(chain.activeRpcUrl).toBe(TEST_RPC_2.rpcUrls.default.http[0]);
});

// Remove
test('should be able to remove an existing custom RPC', async () => {
  rainbowChainsStore.getState().addCustomRPC({ chain: TEST_RPC_3 }); // Add third RPC for removal

  rainbowChainsStore
    .getState()
    .removeCustomRPC({ rpcUrl: TEST_RPC_3.rpcUrls.default.http[0] });
  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_3.id];
  expect(chain).toBeUndefined();
});

test('should remove activeRpcUrl if removed RPC was active and change to another RPC if available', async () => {
  rainbowChainsStore
    .getState()
    .removeCustomRPC({ rpcUrl: TEST_RPC_2.rpcUrls.default.http[0] });

  const chain = rainbowChainsStore.getState().rainbowChains[fantom.id];
  expect(chain.activeRpcUrl).toBe(TEST_RPC_1.rpcUrls.default.http[0]);
  expect(chain.chains.length).toBe(1);
});

test('should remove the CustomChain if last RPC in it is removed', async () => {
  rainbowChainsStore
    .getState()
    .removeCustomRPC({ rpcUrl: TEST_RPC_1.rpcUrls.default.http[0] });

  const chain = rainbowChainsStore.getState().rainbowChains[TEST_RPC_1.id];
  expect(chain).toBeUndefined();
});
