import { describe, expect, it, vi } from 'vitest';

import { estimateGasForCalls, simulateCalls } from './batchSimulation';

vi.mock('@rainbow-me/delegation', () => ({
  prepareBatchedTransaction: vi.fn().mockResolvedValue({
    from: '0x1234567890123456789012345678901234567890',
    to: '0x1234567890123456789012345678901234567890',
    data: '0x',
    value: '0x0',
  }),
}));

vi.mock('~/core/resources/transactions/simulation', () => ({
  simulateTransactions: vi.fn().mockResolvedValue([
    {
      gas: { estimate: '21000' },
      simulation: {},
      scanning: { result: 'OK', description: '' },
    },
  ]),
}));

vi.mock('~/core/viem/clients', () => ({
  getViemClient: vi.fn().mockReturnValue({
    getTransactionCount: vi.fn().mockResolvedValue(5),
  }),
}));

describe('batchSimulation', () => {
  it('simulateCalls returns simulation results', async () => {
    const results = await simulateCalls({
      from: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      calls: [
        {
          to: '0xabcdef123456789012345678901234567890abcd',
          data: '0x',
          value: '0x0',
        },
      ],
      chainId: 1,
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.gas?.estimate).toBe('21000');
  });

  it('estimateGasForCalls returns gas estimate', async () => {
    const estimate = await estimateGasForCalls({
      from: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      calls: [
        {
          to: '0xabcdef123456789012345678901234567890abcd',
          data: '0x',
        },
      ],
      chainId: 1,
    });
    expect(estimate).toBe('21000');
  });

  it('estimateGasForCalls returns undefined for empty calls', async () => {
    const estimate = await estimateGasForCalls({
      from: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      calls: [],
      chainId: 1,
    });
    expect(estimate).toBeUndefined();
  });
});
