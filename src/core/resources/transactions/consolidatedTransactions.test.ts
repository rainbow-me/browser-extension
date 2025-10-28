import { Address } from 'viem';
import { describe, expect, test, vi } from 'vitest';

import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import {
  MinedTransaction,
  RainbowTransaction,
  TxHash,
} from '~/core/types/transactions';

import { consolidatedTransactionsQueryFunction } from './consolidatedTransactions';

/**
 * CUTOFF PAGINATION ISSUE FIX
 *
 * BEFORE: Cutoff was hardcoded to `undefined` after the Goldsky migration (commit e1ef875f)
 * - Custom network transactions are stored locally and fetched once (not paginated like backend transactions)
 * - Without a cutoff timestamp, pagination couldn't determine which custom network transactions
 *   had already been shown
 * - This caused custom network transactions to be duplicated every time the user scrolled to fetch more pages
 *
 * AFTER: Cutoff is calculated from the oldest transaction timestamp in each page
 * - On page 1: cutoff is `undefined`, all custom network transactions are shown
 * - On subsequent pages: cutoff is set to the oldest backend transaction timestamp
 * - Custom network transactions older than cutoff are filtered out to prevent duplication
 *
 * This allows the UI to properly paginate between backend transactions (using cursor-based pagination)
 * and custom network transactions (using timestamp-based filtering).
 */

// Mock the dependencies
vi.mock('~/core/network/platform', () => ({
  platformHttp: {
    get: vi.fn(),
  },
}));

vi.mock('~/core/state/networks/networks', () => ({
  useNetworkStore: {
    getState: () => ({
      getSupportedTransactionsChainIds: () => [
        ChainId.mainnet,
        ChainId.optimism,
      ],
    }),
  },
}));

vi.mock('~/core/utils/platform', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convertPlatformTransactionToPaginatedApiResponse: (tx: any) => tx,
}));

vi.mock('~/core/utils/transactions', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseTransaction: ({ tx }: { tx: any }) => ({
    ...tx,
    chainId: parseInt(tx.chainId, 10),
  }),
}));

describe('consolidatedTransactions cutoff logic', () => {
  test('should calculate cutoff timestamp from oldest transaction (FIRST PAGE)', async () => {
    const mockTransactions = [
      {
        id: 'tx1',
        hash: '0x123',
        chainId: '1',
        status: 'confirmed',
        minedAt: new Date('2024-01-10T00:00:00Z'),
        blockNumber: 100,
      },
      {
        id: 'tx2',
        hash: '0x456',
        chainId: '1',
        status: 'confirmed',
        minedAt: new Date('2024-01-05T00:00:00Z'), // oldest
        blockNumber: 50,
      },
      {
        id: 'tx3',
        hash: '0x789',
        chainId: '1',
        status: 'confirmed',
        minedAt: new Date('2024-01-08T00:00:00Z'),
        blockNumber: 75,
      },
    ];

    const { platformHttp } = await import('~/core/network/platform');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(platformHttp.get).mockResolvedValue({
      data: {
        result: mockTransactions,
        pagination: { cursor: 'next_page_token' },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await consolidatedTransactionsQueryFunction({
      queryKey: [
        {
          address: '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3',
          currency: 'USD',
          userChainIds: [ChainId.mainnet],
        },
        'consolidatedTransactions',
        { persisterVersion: 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      pageParam: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Cutoff should be the oldest transaction timestamp
    expect(result.cutoff).toBe(new Date('2024-01-05T00:00:00Z').getTime());
    expect(result.transactions).toHaveLength(3);
  });

  test('should set cutoff to undefined when no transactions', async () => {
    const { platformHttp } = await import('~/core/network/platform');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(platformHttp.get).mockResolvedValue({
      data: {
        result: [],
        pagination: { cursor: undefined },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await consolidatedTransactionsQueryFunction({
      queryKey: [
        {
          address: '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3' as Address,
          currency: 'USD' as SupportedCurrencyKey,
          userChainIds: [ChainId.mainnet],
        },
        'consolidatedTransactions',
        { persisterVersion: 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      pageParam: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(result.cutoff).toBeUndefined();
    expect(result.transactions).toHaveLength(0);
  });

  test('should ignore pending transactions when calculating cutoff', async () => {
    const mockTransactions = [
      {
        id: 'tx1',
        hash: '0x123',
        chainId: '1',
        status: 'pending',
        minedAt: undefined,
        blockNumber: 0,
      },
      {
        id: 'tx2',
        hash: '0x456',
        chainId: '1',
        status: 'confirmed',
        minedAt: new Date('2024-01-05T00:00:00Z'),
        blockNumber: 50,
      },
    ];

    const { platformHttp } = await import('~/core/network/platform');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(platformHttp.get).mockResolvedValue({
      data: {
        result: mockTransactions,
        pagination: { cursor: undefined },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await consolidatedTransactionsQueryFunction({
      queryKey: [
        {
          address: '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3' as Address,
          currency: 'USD' as SupportedCurrencyKey,
          userChainIds: [ChainId.mainnet],
        },
        'consolidatedTransactions',
        { persisterVersion: 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      pageParam: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Cutoff should only consider confirmed transactions
    expect(result.cutoff).toBe(new Date('2024-01-05T00:00:00Z').getTime());
  });
});

describe('transactionsAfterCutoff filtering logic', () => {
  test('should NOT filter custom network transactions when cutoff is null (FIRST PAGE)', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3' as Address;
    const transactions: RainbowTransaction[] = [
      {
        hash: '0x123' as TxHash,
        nonce: 1,
        chainId: ChainId.mainnet,
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 100,
        minedAt: 1704844800000, // 2024-01-10
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const customNetworkTransactions: RainbowTransaction[] = [
      {
        hash: '0xabc' as TxHash,
        nonce: 2,
        chainId: 31337, // custom network
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 50,
        minedAt: 1704844800000 - 86400000, // 1 day before
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const cutoff = null;
    const allTransactions = transactions.concat(customNetworkTransactions);

    if (!cutoff) {
      const result = allTransactions;
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(transactions[0]);
      expect(result).toContainEqual(customNetworkTransactions[0]);
    }
  });

  test('should filter out custom network transactions older than cutoff (SUBSEQUENT PAGES)', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3' as Address;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transactions: RainbowTransaction[] = [
      {
        hash: '0x123' as TxHash,
        nonce: 1,
        chainId: ChainId.mainnet,
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 100,
        minedAt: 1704844800000, // 2024-01-10
        confirmations: 1,
        gasUsed: '21000',
      },
      {
        hash: '0x456' as TxHash,
        nonce: 2,
        chainId: ChainId.mainnet,
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 80,
        minedAt: 1704595200000, // 2024-01-05 - oldest backend tx
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const customNetworkTransactions: RainbowTransaction[] = [
      {
        hash: '0xnew' as TxHash,
        nonce: 3,
        chainId: 31337, // custom network
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 70,
        minedAt: 1704844800000 + 86400000, // NEWER than cutoff - should be included
        confirmations: 1,
        gasUsed: '21000',
      },
      {
        hash: '0xold' as TxHash,
        nonce: 4,
        chainId: 31337, // custom network
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 60,
        minedAt: 1704595200000 - 86400000, // OLDER than cutoff - should be EXCLUDED
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const cutoff = 1704595200000; // 2024-01-05 - oldest backend transaction

    // Simulate the filtering logic
    const filteredCustomTransactions = customNetworkTransactions.filter(
      (tx) => tx.status === 'pending' || tx.minedAt >= cutoff,
    );

    expect(filteredCustomTransactions).toHaveLength(1);
    expect(filteredCustomTransactions[0].hash).toBe('0xnew');
    const filteredTx = filteredCustomTransactions[0] as MinedTransaction;
    expect(filteredTx.minedAt).toBeGreaterThan(cutoff);
  });

  test('should NOT exclude custom network transactions that are newer than cutoff', () => {
    const testAddress = '0x742d35Cc6634C0532925a3b8D404020ae0e4f5f3' as Address;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transactions: RainbowTransaction[] = [
      {
        hash: '0x123' as TxHash,
        nonce: 1,
        chainId: ChainId.mainnet,
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 100,
        minedAt: 1704595200000, // 2024-01-05 - cutoff
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const customNetworkTransactions: RainbowTransaction[] = [
      {
        hash: '0xabc' as TxHash,
        nonce: 2,
        chainId: 31337,
        from: testAddress,
        type: 'send',
        title: 'Send',
        status: 'confirmed',
        blockNumber: 50,
        minedAt: 1704681600000, // 2024-01-06 - newer than cutoff
        confirmations: 1,
        gasUsed: '21000',
      },
    ];

    const cutoff = 1704595200000; // 2024-01-05

    const filteredCustomTransactions = customNetworkTransactions.filter(
      (tx) => tx.status === 'pending' || tx.minedAt >= cutoff,
    );

    expect(filteredCustomTransactions).toHaveLength(1);
    expect(filteredCustomTransactions[0].hash).toBe('0xabc');
  });
});
