import type {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';
import { createStore, del, get, set } from 'idb-keyval';

const IDB_DB_NAME = 'rainbow-react-query';
const IDB_STORE_NAME = 'query-cache';
const IDB_KEY = 'persisted-client';

const THROTTLE_MS = 600; // 600ms to batch writes to IndexedDB

const idbStore = createStore(IDB_DB_NAME, IDB_STORE_NAME);

/**
 * Strip non-cloneable values (Promise, Function, Symbol) so IndexedDB can store.
 * Fast path: structuredClone when possible; fallback: single-pass recursive strip.
 */
export function toStructuredCloneable(
  client: PersistedClient,
): PersistedClient {
  try {
    return structuredClone(client);
  } catch {
    return stripNonCloneable(client) as PersistedClient;
  }
}

function stripNonCloneable<T>(val: T): T {
  if (val === null) return val;
  if (typeof val !== 'object')
    return (typeof val === 'symbol' ? undefined : val) as T;
  if (val instanceof Promise || typeof val === 'function')
    return undefined as T;
  if (Array.isArray(val)) {
    return val.map((x) => stripNonCloneable(x) ?? null) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as object)) {
    if (v instanceof Promise || typeof v === 'function') continue;
    const stripped = stripNonCloneable(v);
    if (stripped !== undefined) out[k] = stripped;
  }
  return out as T;
}

let throttleTimer: ReturnType<typeof setTimeout> | null = null;
let pendingClient: PersistedClient | null = null;

export const queryClientPersister: Persister = {
  persistClient: async (client) => {
    pendingClient = client;
    if (throttleTimer !== null) return;
    throttleTimer = setTimeout(async () => {
      throttleTimer = null;
      const toWrite = pendingClient;
      pendingClient = null;
      if (toWrite) {
        await set(IDB_KEY, toStructuredCloneable(toWrite), idbStore);
      }
    }, THROTTLE_MS);
  },
  restoreClient: async () => {
    return get<PersistedClient>(IDB_KEY, idbStore);
  },
  removeClient: async () => {
    await del(IDB_KEY, idbStore);
  },
};
