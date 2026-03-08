import 'fake-indexeddb/auto';

import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { afterEach, expect, test, vi } from 'vitest';

import {
  queryClientPersister,
  toStructuredCloneable,
} from './queryClientStorage';

afterEach(async () => {
  vi.useRealTimers();
  await queryClientPersister.removeClient();
});

const mockPersistedClient = {
  buster: '3',
  clientState: {
    mutations: [],
    queries: [
      {
        queryKey: ['test'],
        queryHash: '["test"]',
        state: { data: { foo: 'bar' }, dataUpdatedAt: 0 },
      },
    ],
  },
  timestamp: Date.now(),
} as unknown as PersistedClient;

test('toStructuredCloneable returns clone of plain object', () => {
  const input = { a: 1, b: { c: 2 } } as unknown as PersistedClient;
  const result = toStructuredCloneable(input);
  expect(result).toEqual(input);
  expect(result).not.toBe(input);
});

const nonCloneableValues = [
  { name: 'Function', value: () => undefined },
  { name: 'Promise', value: Promise.resolve(1) },
  { name: 'Symbol', value: Symbol('test') },
] as const;

test.each(nonCloneableValues)(
  'toStructuredCloneable strips $name as object property',
  ({ value }) => {
    const input = {
      ...mockPersistedClient,
      clientState: {
        ...mockPersistedClient.clientState,
        extra: value,
      },
    } as unknown as PersistedClient;
    const result = toStructuredCloneable(input);
    expect(result.clientState).not.toHaveProperty('extra');
  },
);

test.each(nonCloneableValues)(
  'toStructuredCloneable strips $name as array element',
  ({ value }) => {
    const input = {
      ...mockPersistedClient,
      clientState: {
        mutations: [],
        queries: [value, mockPersistedClient.clientState.queries[0]],
      },
    } as unknown as PersistedClient;
    const result = toStructuredCloneable(input);
    expect(result.clientState.queries[0]).toBeNull();
    expect(result.clientState.queries[1]).toEqual(
      mockPersistedClient.clientState.queries[0],
    );
  },
);

test('toStructuredCloneable strips nested non-cloneable in arrays', () => {
  const input = {
    ...mockPersistedClient,
    clientState: {
      mutations: [],
      queries: [
        {
          queryKey: ['test'],
          queryHash: '["test"]',
          state: {
            data: { fn: () => undefined },
            dataUpdatedAt: 0,
          },
        },
      ],
    },
  } as unknown as PersistedClient;
  const result = toStructuredCloneable(input);
  expect(result.clientState.queries[0].state.data).toEqual({});
});

test.each(nonCloneableValues)(
  'IndexedDB persist+restore succeeds with $name as object property',
  async ({ value }) => {
    const client = {
      ...mockPersistedClient,
      clientState: {
        ...mockPersistedClient.clientState,
        extra: value,
      },
    } as unknown as PersistedClient;
    queryClientPersister.persistClient(client);
    await new Promise<void>((r) => {
      setTimeout(r, 700);
    });

    const result = await queryClientPersister.restoreClient();
    expect(result).toBeDefined();
    expect(result?.clientState).not.toHaveProperty('extra');
    expect(result?.buster).toBe(mockPersistedClient.buster);
    expect(result?.clientState.queries).toEqual(
      mockPersistedClient.clientState.queries,
    );
  },
);

test.each(nonCloneableValues)(
  'IndexedDB persist+restore succeeds with $name as array element',
  async ({ value }) => {
    const client = {
      ...mockPersistedClient,
      clientState: {
        mutations: [],
        queries: [value, mockPersistedClient.clientState.queries[0]],
      },
    } as unknown as PersistedClient;
    queryClientPersister.persistClient(client);
    await new Promise<void>((r) => {
      setTimeout(r, 700);
    });

    const result = await queryClientPersister.restoreClient();
    expect(result).toBeDefined();
    expect(result?.clientState.queries[0]).toBeNull();
    expect(result?.clientState.queries[1]).toEqual(
      mockPersistedClient.clientState.queries[0],
    );
  },
);

test('IndexedDB persist+restore succeeds with multiple non-cloneable types', async () => {
  const client = {
    ...mockPersistedClient,
    clientState: {
      mutations: [Promise.resolve() as unknown as object],
      queries: [
        Symbol('x'),
        {
          queryKey: ['test'],
          queryHash: '["test"]',
          state: {
            data: { fn: () => undefined, sym: Symbol('y') },
            dataUpdatedAt: 0,
          },
        },
      ],
    },
  } as unknown as PersistedClient;
  queryClientPersister.persistClient(client);
  await new Promise<void>((r) => {
    setTimeout(r, 700);
  });

  const result = await queryClientPersister.restoreClient();
  expect(result).toBeDefined();
  expect(result?.clientState.mutations).toEqual([null]);
  expect(result?.clientState.queries[0]).toBeNull();
  expect(result?.clientState.queries[1].state.data).toEqual({});
});

test('restoreClient returns undefined when empty', async () => {
  const result = await queryClientPersister.restoreClient();
  expect(result).toBeUndefined();
});

test('persistClient then restoreClient round-trips data', async () => {
  queryClientPersister.persistClient(mockPersistedClient);
  await new Promise<void>((r) => {
    setTimeout(r, 700);
  });

  const result = await queryClientPersister.restoreClient();
  expect(result).toEqual(mockPersistedClient);
});

test('removeClient clears stored data', async () => {
  queryClientPersister.persistClient(mockPersistedClient);
  await new Promise<void>((r) => {
    setTimeout(r, 700);
  });

  expect(await queryClientPersister.restoreClient()).toEqual(
    mockPersistedClient,
  );

  await queryClientPersister.removeClient();
  const result = await queryClientPersister.restoreClient();
  expect(result).toBeUndefined();
});

test('persistClient throttles rapid writes', async () => {
  const client1 = { ...mockPersistedClient, buster: '1' };
  const client2 = { ...mockPersistedClient, buster: '2' };
  const client3 = { ...mockPersistedClient, buster: '3' };

  queryClientPersister.persistClient(client1);
  queryClientPersister.persistClient(client2);
  queryClientPersister.persistClient(client3);

  await new Promise<void>((r) => {
    setTimeout(r, 700);
  });

  const result = await queryClientPersister.restoreClient();
  expect(result?.buster).toBe('3');
});
