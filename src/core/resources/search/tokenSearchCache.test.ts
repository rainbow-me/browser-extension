import 'fake-indexeddb/auto';

import { afterEach, expect, test, vi } from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  clearTokenSearchCache,
  evictExpiredEntries,
  getAllTokenSearchCacheKeys,
  getManyTokenSearchFromCache,
  getTokenSearchFromCache,
  setTokenSearchInCache,
  toCacheKeyString,
} from './tokenSearchCache';

const mockAsset = {
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

function cacheKey(
  overrides: Partial<Parameters<typeof getTokenSearchFromCache>[0]> = {},
) {
  return {
    chainId: ChainId.mainnet,
    list: 'verifiedAssets' as const,
    query: '',
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

test('get returns null when cache is empty', async () => {
  const result = await getTokenSearchFromCache(cacheKey());
  expect(result).toBeNull();
});

test('set then get returns cached data', async () => {
  const key = cacheKey();
  const data = [mockAsset];
  await setTokenSearchInCache(key, data);
  const result = await getTokenSearchFromCache(key);
  expect(result).toEqual(data);
});

test('different cache keys are isolated', async () => {
  const key1 = cacheKey({ chainId: ChainId.mainnet });
  const key2 = cacheKey({ chainId: ChainId.arbitrum });
  await setTokenSearchInCache(key1, [{ ...mockAsset, uniqueId: 'a' }]);
  await setTokenSearchInCache(key2, [{ ...mockAsset, uniqueId: 'b' }]);

  const result1 = await getTokenSearchFromCache(key1);
  const result2 = await getTokenSearchFromCache(key2);

  expect(result1).toHaveLength(1);
  expect(result1![0].uniqueId).toBe('a');
  expect(result2).toHaveLength(1);
  expect(result2![0].uniqueId).toBe('b');
});

test('cache key includes fromChainId when present', async () => {
  const keyWith = cacheKey({ fromChainId: ChainId.arbitrum });
  const keyWithout = cacheKey();
  await setTokenSearchInCache(keyWith, [{ ...mockAsset, uniqueId: 'with' }]);
  await setTokenSearchInCache(keyWithout, [
    { ...mockAsset, uniqueId: 'without' },
  ]);

  expect(await getTokenSearchFromCache(keyWith)).toHaveLength(1);
  expect((await getTokenSearchFromCache(keyWith))![0].uniqueId).toBe('with');
  expect(await getTokenSearchFromCache(keyWithout)).toHaveLength(1);
  expect((await getTokenSearchFromCache(keyWithout))![0].uniqueId).toBe(
    'without',
  );
});

test('cache key includes query string', async () => {
  const keyEmpty = cacheKey({ query: '' });
  const keySearch = cacheKey({ query: 'eth' });
  await setTokenSearchInCache(keyEmpty, [{ ...mockAsset, uniqueId: 'empty' }]);
  await setTokenSearchInCache(keySearch, [
    { ...mockAsset, uniqueId: 'search' },
  ]);

  expect((await getTokenSearchFromCache(keyEmpty))![0].uniqueId).toBe('empty');
  expect((await getTokenSearchFromCache(keySearch))![0].uniqueId).toBe(
    'search',
  );
});

test('clear removes all cached data', async () => {
  const key = cacheKey();
  await setTokenSearchInCache(key, [mockAsset]);
  expect(await getTokenSearchFromCache(key)).not.toBeNull();

  await clearTokenSearchCache();
  const result = await getTokenSearchFromCache(key);
  expect(result).toBeNull();
});

test('set overwrites existing value for same key', async () => {
  const key = cacheKey();
  await setTokenSearchInCache(key, [{ ...mockAsset, uniqueId: 'v1' }]);
  await setTokenSearchInCache(key, [{ ...mockAsset, uniqueId: 'v2' }]);

  const result = await getTokenSearchFromCache(key);
  expect(result).toHaveLength(1);
  expect(result![0].uniqueId).toBe('v2');
});

test('getMany fetches only requested keys in one transaction', async () => {
  const key1 = cacheKey({ chainId: ChainId.mainnet });
  const key2 = cacheKey({ chainId: ChainId.arbitrum });
  const key3 = cacheKey({ chainId: ChainId.polygon });
  await setTokenSearchInCache(key1, [{ ...mockAsset, uniqueId: 'a' }]);
  await setTokenSearchInCache(key2, [{ ...mockAsset, uniqueId: 'b' }]);

  const result = await getManyTokenSearchFromCache([key1, key2, key3]);
  expect(result.size).toBe(2);
  expect(result.get(toCacheKeyString(key1))![0].uniqueId).toBe('a');
  expect(result.get(toCacheKeyString(key2))![0].uniqueId).toBe('b');
});

test('getAllCacheKeys returns keys without loading values', async () => {
  const key1 = cacheKey({ chainId: ChainId.mainnet });
  const key2 = cacheKey({ chainId: ChainId.arbitrum });
  await setTokenSearchInCache(key1, [mockAsset]);
  await setTokenSearchInCache(key2, [mockAsset]);

  const keys = await getAllTokenSearchCacheKeys();
  expect(keys).toHaveLength(2);
  expect(keys).toContain(toCacheKeyString(key1));
  expect(keys).toContain(toCacheKeyString(key2));
});

test('entries expire after 12h TTL', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(0);

  const key = cacheKey();
  await setTokenSearchInCache(key, [mockAsset]);
  expect(await getTokenSearchFromCache(key)).toHaveLength(1);

  vi.setSystemTime(12 * 60 * 60 * 1000 - 1); // 1ms before expiry
  expect(await getTokenSearchFromCache(key)).toHaveLength(1);

  vi.setSystemTime(12 * 60 * 60 * 1000 + 1); // 1ms after expiry
  expect(await getTokenSearchFromCache(key)).toBeNull();
});

test('evictExpiredEntries removes expired entries and returns count', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(0);

  const key1 = cacheKey({ chainId: ChainId.mainnet });
  const key2 = cacheKey({ chainId: ChainId.arbitrum });
  await setTokenSearchInCache(key1, [mockAsset]);
  await setTokenSearchInCache(key2, [mockAsset]);

  vi.setSystemTime(12 * 60 * 60 * 1000 + 1);
  const evicted = await evictExpiredEntries();
  expect(evicted).toBe(2);
  expect(await getTokenSearchFromCache(key1)).toBeNull();
  expect(await getTokenSearchFromCache(key2)).toBeNull();
  expect(await getAllTokenSearchCacheKeys()).toHaveLength(0);
});
