/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'fake-indexeddb/auto';

import { IDBFactory as FDBFactory } from 'fake-indexeddb';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { type UseStore, createResilientStore } from './resilientIdb';

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(store: UseStore, key: string, value: unknown): Promise<void> {
  return store('readwrite', (s) => {
    return new Promise<void>((resolve, reject) => {
      const req = s.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function idbGet<T>(store: UseStore, key: string): Promise<T | undefined> {
  return store('readonly', (s) => {
    return new Promise<T | undefined>((resolve, reject) => {
      const req = s.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  });
}

function idbDelete(store: UseStore, key: string): Promise<void> {
  return store('readwrite', (s) => {
    return new Promise<void>((resolve, reject) => {
      const req = s.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function idbClear(store: UseStore): Promise<void> {
  return store('readwrite', (s) => {
    return new Promise<void>((resolve, reject) => {
      const req = s.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function idbAllKeys(store: UseStore): Promise<IDBValidKey[]> {
  return store('readonly', (s) => {
    return new Promise<IDBValidKey[]>((resolve, reject) => {
      const req = s.getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

let dbCounter = 0;
function uniqueDbName() {
  return `test-db-${++dbCounter}-${Date.now()}`;
}

afterEach(() => {
  // eslint-disable-next-line no-global-assign
  indexedDB = new FDBFactory();
});

// ---------------------------------------------------------------------------
// Basic CRUD
// ---------------------------------------------------------------------------

describe('basic CRUD operations', () => {
  const valueTypes = [
    { name: 'string', value: 'hello' },
    { name: 'number', value: 42 },
    { name: 'object', value: { nested: { deep: true } } },
    { name: 'array', value: [1, 'two', { three: 3 }] },
    { name: 'boolean', value: true },
    { name: 'null', value: null },
  ] as const;

  test.each(valueTypes)('get & set with $name value', async ({ value }) => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'key', value);
    expect(await idbGet(store, 'key')).toEqual(value);
  });

  test('get returns undefined for non-existent key', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    expect(await idbGet(store, 'missing')).toBeUndefined();
  });

  test('set overwrites existing value', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'key', 'first');
    await idbPut(store, 'key', 'second');
    expect(await idbGet(store, 'key')).toBe('second');
  });

  test('delete removes a key', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'key', 'value');
    await idbDelete(store, 'key');
    expect(await idbGet(store, 'key')).toBeUndefined();
  });

  test('delete on non-existent key does not throw', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await expect(idbDelete(store, 'nope')).resolves.toBeUndefined();
  });

  test('clear removes all keys', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'a', 1);
    await idbPut(store, 'b', 2);
    await idbClear(store);
    expect(await idbGet(store, 'a')).toBeUndefined();
    expect(await idbGet(store, 'b')).toBeUndefined();
  });

  test('getAllKeys returns all stored keys', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'x', 1);
    await idbPut(store, 'y', 2);
    const allKeys = await idbAllKeys(store);
    expect(allKeys.sort()).toEqual(['x', 'y']);
  });
});

// ---------------------------------------------------------------------------
// Transaction modes
// ---------------------------------------------------------------------------

describe('transaction modes', () => {
  const modes: Array<{ mode: IDBTransactionMode; op: string }> = [
    { mode: 'readonly', op: 'read' },
    { mode: 'readwrite', op: 'write' },
  ];

  test.each(modes)(
    'passes correct $mode mode to callback',
    async ({ mode }) => {
      const store = createResilientStore(uniqueDbName(), 'store');
      if (mode === 'readwrite') {
        await idbPut(store, 'setup', 'data');
      }

      let receivedMode: string | undefined;
      await store(mode, (s) => {
        receivedMode = s.transaction.mode;
        return Promise.resolve();
      });
      expect(receivedMode).toBe(mode);
    },
  );
});

// ---------------------------------------------------------------------------
// Store isolation
// ---------------------------------------------------------------------------

describe('store isolation', () => {
  test('separate databases do not share data', async () => {
    const storeA = createResilientStore(uniqueDbName(), 'store');
    const storeB = createResilientStore(uniqueDbName(), 'store');

    await idbPut(storeA, 'key', 'A');
    await idbPut(storeB, 'key', 'B');

    expect(await idbGet(storeA, 'key')).toBe('A');
    expect(await idbGet(storeB, 'key')).toBe('B');
  });

  test('same database reused across calls', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'store');

    await idbPut(store, 'k', 'v');
    expect(await idbGet(store, 'k')).toBe('v');
    expect(await idbGet(store, 'k')).toBe('v');
  });
});

// ---------------------------------------------------------------------------
// idb-keyval compatibility
// ---------------------------------------------------------------------------

describe('idb-keyval compatibility', () => {
  test('works with idb-keyval get/set/del', async () => {
    const { get, set, del } = await import('idb-keyval');
    const store = createResilientStore(uniqueDbName(), 'kv');

    await set('foo', 'bar', store);
    expect(await get('foo', store)).toBe('bar');

    await del('foo', store);
    expect(await get('foo', store)).toBeUndefined();
  });

  test('works with idb-keyval entries/keys/values', async () => {
    const { set, keys, values, entries, clear } = await import('idb-keyval');
    const store = createResilientStore(uniqueDbName(), 'kv');

    await set('a', 1, store);
    await set('b', 2, store);

    expect((await keys(store)).sort()).toEqual(['a', 'b']);
    expect((await values(store)).sort()).toEqual([1, 2]);
    expect(
      (await entries(store)).sort(([a], [b]) =>
        String(a).localeCompare(String(b)),
      ),
    ).toEqual([
      ['a', 1],
      ['b', 2],
    ]);

    await clear(store);
    expect(await keys(store)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Custom version & onUpgrade
// ---------------------------------------------------------------------------

describe('versioned databases with onUpgrade', () => {
  test('calls onUpgrade with correct oldVersion on fresh database', async () => {
    const onUpgrade = vi.fn((db: IDBDatabase) => {
      db.createObjectStore('custom');
    });

    const store = createResilientStore(uniqueDbName(), 'custom', {
      version: 1,
      onUpgrade,
    });

    await idbPut(store, 'key', 'val');
    expect(onUpgrade).toHaveBeenCalledOnce();
    expect(onUpgrade).toHaveBeenCalledWith(expect.any(Object), 0);
  });

  test('creates indexes via onUpgrade', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'items', {
      version: 1,
      onUpgrade: (db) => {
        const s = db.createObjectStore('items');
        s.createIndex('by-timestamp', 'timestamp', { unique: false });
      },
    });

    await store('readwrite', (s) => {
      s.put({ timestamp: 100, data: 'first' }, 'a');
      s.put({ timestamp: 200, data: 'second' }, 'b');
      return Promise.resolve();
    });

    const result = await store('readonly', (s) => {
      return new Promise<string[]>((resolve, reject) => {
        const idx = s.index('by-timestamp');
        const req = idx.getAll();
        req.onsuccess = () =>
          resolve((req.result as Array<{ data: string }>).map((r) => r.data));
        req.onerror = () => reject(req.error);
      });
    });

    expect(result).toEqual(['first', 'second']);
  });

  test('default onUpgrade creates object store automatically', async () => {
    const store = createResilientStore(uniqueDbName(), 'auto-created');
    await idbPut(store, 'key', 'works');
    expect(await idbGet(store, 'key')).toBe('works');
  });
});

// ---------------------------------------------------------------------------
// Connection resilience — InvalidStateError recovery
// ---------------------------------------------------------------------------

describe('InvalidStateError recovery', () => {
  function makeInvalidStateError(): DOMException {
    const err = new DOMException(
      'A mutation operation was attempted on a database that did not allow mutations',
      'InvalidStateError',
    );
    return err;
  }

  test('retries once and succeeds after InvalidStateError on first attempt', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'store');

    await idbPut(store, 'key', 'original');

    let callCount = 0;
    const result = await store('readonly', (s) => {
      callCount++;
      if (callCount === 1) {
        throw makeInvalidStateError();
      }
      return idbRequest(s.get('key'));
    });

    expect(callCount).toBe(2);
    expect(result).toBe('original');
  });

  test('throws if InvalidStateError occurs on both attempts', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');

    await expect(
      store('readonly', () => {
        throw makeInvalidStateError();
      }),
    ).rejects.toSatisfy((e: DOMException) => e.name === 'InvalidStateError');
  });

  test.each([
    { name: 'readwrite', mode: 'readwrite' as const },
    { name: 'readonly', mode: 'readonly' as const },
  ])('recovers from InvalidStateError in $name mode', async ({ mode }) => {
    const store = createResilientStore(uniqueDbName(), 'store');
    if (mode === 'readwrite') {
      await idbPut(store, 'setup', 'data');
    }

    let callCount = 0;
    await store(mode, (s) => {
      callCount++;
      if (callCount === 1) throw makeInvalidStateError();
      return Promise.resolve(mode === 'readonly' ? s.get('setup') : undefined);
    });
    expect(callCount).toBe(2);
  });

  test('non-InvalidStateError DOMExceptions are not retried', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');

    let callCount = 0;
    await expect(
      store('readonly', () => {
        callCount++;
        throw new DOMException('Something else', 'DataError');
      }),
    ).rejects.toSatisfy((e: DOMException) => e.name === 'DataError');
    expect(callCount).toBe(1);
  });

  test('generic errors are not retried', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');

    let callCount = 0;
    await expect(
      store('readonly', () => {
        callCount++;
        throw new Error('generic failure');
      }),
    ).rejects.toThrow('generic failure');
    expect(callCount).toBe(1);
  });

  test('data written before InvalidStateError is preserved after recovery', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'store');
    await idbPut(store, 'persistent', 'data');

    let callCount = 0;
    await store('readonly', (s) => {
      callCount++;
      if (callCount === 1) throw makeInvalidStateError();
      return idbRequest(s.get('persistent'));
    }).then((val) => {
      expect(val).toBe('data');
    });
  });
});

// ---------------------------------------------------------------------------
// Connection lifecycle — onclose / onversionchange
// ---------------------------------------------------------------------------

describe('connection lifecycle events', () => {
  test('reconnects after database onclose event', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'store');

    await idbPut(store, 'key', 'before-close');

    // Reach into the cached db and fire its onclose handler to simulate
    // an abnormal close (e.g. browser reclaiming resources).
    const db = await new Promise<IDBDatabase>((resolve) => {
      const req = indexedDB.open(dbName);
      req.onsuccess = () => resolve(req.result);
    });
    // The store's internal db has onclose set — trigger it via the same
    // mechanism: open the db and call its onclose if set.
    // Instead, we use the store itself to get the internal db reference
    // by capturing it inside a callback.
    let internalDb: IDBDatabase | null = null;
    await store('readonly', (s) => {
      internalDb = s.transaction.db;
      return Promise.resolve();
    });
    db.close();

    // Simulate abnormal close by calling the onclose handler directly
    if (internalDb && (internalDb as IDBDatabase).onclose) {
      (internalDb as IDBDatabase).onclose!(new Event('close'));
    }

    // Store should reconnect and still work
    const val = await idbGet(store, 'key');
    expect(val).toBe('before-close');
  });

  test('versionchange from another context closes and reconnects', async () => {
    const dbName = uniqueDbName();
    const store = createResilientStore(dbName, 'store');

    await idbPut(store, 'before', 'upgrade');

    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(dbName, 999);
      req.onupgradeneeded = () => {
        // don't delete the existing store, just trigger the versionchange
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });

    const val = await idbGet(store, 'before');
    expect(val).toBe('upgrade');
  });
});

// ---------------------------------------------------------------------------
// Concurrent access
// ---------------------------------------------------------------------------

describe('concurrent operations', () => {
  test('parallel reads return correct values', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'a', 1);
    await idbPut(store, 'b', 2);
    await idbPut(store, 'c', 3);

    const [a, b, c] = await Promise.all([
      idbGet(store, 'a'),
      idbGet(store, 'b'),
      idbGet(store, 'c'),
    ]);
    expect([a, b, c]).toEqual([1, 2, 3]);
  });

  test('parallel writes all persist', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await Promise.all([
      idbPut(store, 'a', 1),
      idbPut(store, 'b', 2),
      idbPut(store, 'c', 3),
    ]);
    expect(await idbGet(store, 'a')).toBe(1);
    expect(await idbGet(store, 'b')).toBe(2);
    expect(await idbGet(store, 'c')).toBe(3);
  });

  test('mixed parallel read/write operations', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await idbPut(store, 'existing', 'value');

    const [readResult] = await Promise.all([
      idbGet(store, 'existing'),
      idbPut(store, 'new', 'data'),
    ]);

    expect(readResult).toBe('value');
    expect(await idbGet(store, 'new')).toBe('data');
  });
});

// ---------------------------------------------------------------------------
// Callback return types (sync, async, PromiseLike)
// ---------------------------------------------------------------------------

describe('callback return types', () => {
  test('handles synchronous value callback return', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    const result = await store('readonly', () => 42);
    expect(result).toBe(42);
  });

  test('handles Promise callback return', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    const result = await store('readonly', () => Promise.resolve(42));
    expect(result).toBe(42);
  });

  test('handles PromiseLike (thenable) callback return', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    const thenable = { then: (cb: (v: number) => void) => cb(42) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await store('readonly', () => thenable as any);
    expect(result).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// Error propagation
// ---------------------------------------------------------------------------

describe('error propagation', () => {
  const errorTypes = [
    { name: 'Error', create: () => new Error('boom') },
    { name: 'TypeError', create: () => new TypeError('type boom') },
    {
      name: 'DOMException (DataError)',
      create: () => new DOMException('data boom', 'DataError'),
    },
    { name: 'string throw', create: () => 'string error' },
  ];

  test.each(errorTypes)(
    '$name from callback propagates without retry',
    async ({ create }) => {
      const store = createResilientStore(uniqueDbName(), 'store');
      let callCount = 0;
      await expect(
        store('readonly', () => {
          callCount++;
          throw create();
        }),
      ).rejects.toThrow();
      expect(callCount).toBe(1);
    },
  );
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('indexedDB.open failure', () => {
  test('rejects when indexedDB.open fails', async () => {
    const originalOpen = indexedDB.open.bind(indexedDB);
    let callCount = 0;
    vi.spyOn(indexedDB, 'open').mockImplementation((...args) => {
      callCount++;
      const req = originalOpen(...args);
      // Simulate the open request failing
      setTimeout(() => {
        if (req.onerror) {
          Object.defineProperty(req, 'error', {
            value: new DOMException('Disk full', 'QuotaExceededError'),
          });
          req.onerror(new Event('error'));
        }
      }, 0);
      // Prevent the real onsuccess from firing by removing the listener
      const origOnSuccess = Object.getOwnPropertyDescriptor(
        IDBRequest.prototype,
        'onsuccess',
      );
      Object.defineProperty(req, 'onsuccess', {
        set: () => undefined,
        get: () => null,
        configurable: true,
      });
      if (origOnSuccess) {
        Object.defineProperty(IDBRequest.prototype, 'onsuccess', origOnSuccess);
      }
      return req;
    });

    const store = createResilientStore(uniqueDbName(), 'store');
    await expect(idbGet(store, 'key')).rejects.toSatisfy(
      (e: DOMException) => e.name === 'QuotaExceededError',
    );

    vi.restoreAllMocks();
  });
});

describe('edge cases', () => {
  test('empty string database and store names work', async () => {
    const store = createResilientStore('', '');
    await idbPut(store, 'key', 'val');
    expect(await idbGet(store, 'key')).toBe('val');
  });

  test('multiple stores from same database name are independent instances', async () => {
    const dbName = uniqueDbName();
    const store1 = createResilientStore(dbName, 'store');
    const store2 = createResilientStore(dbName, 'store');

    await idbPut(store1, 'key', 'from-store1');
    expect(await idbGet(store2, 'key')).toBe('from-store1');
  });

  test('store works after many sequential operations', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    for (let i = 0; i < 50; i++) {
      await idbPut(store, `key-${i}`, i);
    }
    expect(await idbGet(store, 'key-49')).toBe(49);
    expect((await idbAllKeys(store)).length).toBe(50);
  });

  test('rejected promise from callback propagates', async () => {
    const store = createResilientStore(uniqueDbName(), 'store');
    await expect(
      store('readonly', () => Promise.reject(new Error('async fail'))),
    ).rejects.toThrow('async fail');
  });
});
