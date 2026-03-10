import 'fake-indexeddb/auto';

import { beforeEach, expect, test, vi } from 'vitest';

import { ChainId } from '~/core/types/chains';

import { clearTokenSearchCache } from './tokenSearchCache';
import {
  searchTokenSearch,
  searchTokenSearchAllNetworks,
} from './tokenSearchService';

vi.mock('~/core/network/tokenSearch', () => ({
  tokenSearchHttp: {
    get: vi.fn(),
  },
}));

const { tokenSearchHttp } = await import('~/core/network/tokenSearch');

function mockResponse(data: { data: unknown[] }) {
  return {
    data,
    headers: new Headers(),
    status: 200,
  };
}

const mockSearchAsset = {
  address: '0x0' as const,
  chainId: ChainId.mainnet,
  decimals: 18,
  highLiquidity: true,
  icon_url: '',
  isNativeAsset: false,
  isVerified: true,
  mainnetAddress: '0x0' as const,
  name: 'Test',
  networks: {},
  symbol: 'TEST',
  uniqueId: 'test_1',
};

beforeEach(async () => {
  vi.clearAllMocks();
  await clearTokenSearchCache();
});

test('searchTokenSearch returns cached data on hit', async () => {
  vi.mocked(tokenSearchHttp.get).mockResolvedValue(
    mockResponse({ data: [mockSearchAsset] }),
  );

  const args = {
    chainId: ChainId.mainnet,
    list: 'verifiedAssets' as const,
    query: '',
  };

  const first = await searchTokenSearch(args);
  expect(first).toHaveLength(1);
  expect(tokenSearchHttp.get).toHaveBeenCalledTimes(1);

  const second = await searchTokenSearch(args);
  expect(second).toHaveLength(1);
  expect(tokenSearchHttp.get).toHaveBeenCalledTimes(1);
});

test('searchTokenSearch fetches and caches on miss', async () => {
  vi.mocked(tokenSearchHttp.get).mockResolvedValue(
    mockResponse({ data: [mockSearchAsset] }),
  );

  const result = await searchTokenSearch({
    chainId: ChainId.mainnet,
    list: 'verifiedAssets',
    query: 'eth',
  });

  expect(result).toHaveLength(1);
  expect(result[0].uniqueId).toContain('test_1');
  expect(tokenSearchHttp.get).toHaveBeenCalledWith(
    expect.stringContaining('/1/'),
  );
});

test('searchTokenSearch returns empty array on HTTP error', async () => {
  vi.mocked(tokenSearchHttp.get).mockRejectedValue(new Error('Network error'));

  const result = await searchTokenSearch({
    chainId: ChainId.mainnet,
    list: 'verifiedAssets',
    query: '',
  });

  expect(result).toEqual([]);
});

test('searchTokenSearchAllNetworks uses batch cache and fetches misses', async () => {
  vi.mocked(tokenSearchHttp.get)
    .mockResolvedValueOnce(
      mockResponse({ data: [{ ...mockSearchAsset, uniqueId: 'a' }] }),
    )
    .mockResolvedValueOnce(
      mockResponse({ data: [{ ...mockSearchAsset, uniqueId: 'b' }] }),
    );

  const result = await searchTokenSearchAllNetworks(
    { list: 'verifiedAssets', query: '' },
    [ChainId.mainnet, ChainId.arbitrum],
  );

  expect(result).toHaveLength(2);
  expect(tokenSearchHttp.get).toHaveBeenCalledTimes(2);

  const secondCall = await searchTokenSearchAllNetworks(
    { list: 'verifiedAssets', query: '' },
    [ChainId.mainnet, ChainId.arbitrum],
  );
  expect(secondCall).toHaveLength(2);
  expect(tokenSearchHttp.get).toHaveBeenCalledTimes(2);
});

test('searchTokenSearchAllNetworks returns empty on HTTP error for a chain', async () => {
  vi.mocked(tokenSearchHttp.get)
    .mockResolvedValueOnce(mockResponse({ data: [mockSearchAsset] }))
    .mockRejectedValueOnce(new Error('Network error'));

  const result = await searchTokenSearchAllNetworks(
    { list: 'verifiedAssets', query: '' },
    [ChainId.mainnet, ChainId.arbitrum],
  );

  expect(result).toHaveLength(1);
});
