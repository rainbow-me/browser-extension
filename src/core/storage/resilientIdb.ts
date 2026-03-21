/**
 * Resilient IndexedDB store that automatically reconnects when the
 * underlying IDBDatabase connection goes stale.
 *
 * In browser extensions, IndexedDB is shared across the extension's
 * origin — the background context, popup, side panel, and offscreen
 * documents all operate on the same database. When any context triggers
 * a version upgrade, other open connections receive a `versionchange`
 * event and are closed.
 * See https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies
 *
 * This primarily manifests in Firefox because the Firefox build uses a
 * persistent background page (MV2-style `background.scripts`) instead
 * of a service worker (see scripts/firefox-manifest.js). The background
 * page stays alive for the entire browser session, so a cached
 * IDBDatabase reference that goes stale (e.g. from a versionchange
 * triggered by the popup) persists indefinitely with no natural
 * recovery. In Chrome's MV3 service worker model, the worker is
 * terminated after ~30s of inactivity and restarts fresh, naturally
 * flushing stale connections.
 *
 * Prevents `InvalidStateError: A mutation operation was attempted on a
 * database that did not allow mutations` by catching the error at the
 * transaction layer and retrying once with a fresh connection.
 *
 * Works as a drop-in replacement for idb-keyval's `createStore`, and
 * also supports versioned databases with custom upgrade logic.
 */

export type UseStore = <T>(
  txMode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => T | PromiseLike<T>,
) => Promise<T>;

type StoreOptions = {
  version?: number;
  onUpgrade?: (db: IDBDatabase, oldVersion: number) => void;
};

export function createResilientStore(
  dbName: string,
  storeName: string,
  options?: StoreOptions,
): UseStore {
  let dbPromise: Promise<IDBDatabase> | null = null;

  function openDb(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = options?.version
        ? indexedDB.open(dbName, options.version)
        : indexedDB.open(dbName);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = (event) => {
        if (options?.onUpgrade) {
          options.onUpgrade(req.result, event.oldVersion);
        } else {
          req.result.createObjectStore(storeName);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onclose = () => {
          dbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
    });
  }

  function getDb(): Promise<IDBDatabase> {
    if (!dbPromise) dbPromise = openDb();
    return dbPromise;
  }

  function execute<T>(
    db: IDBDatabase,
    txMode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => T | PromiseLike<T>,
  ): T | PromiseLike<T> {
    return callback(db.transaction(storeName, txMode).objectStore(storeName));
  }

  return async <T>(
    txMode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => T | PromiseLike<T>,
  ): Promise<T> => {
    try {
      const db = await getDb();
      return await execute(db, txMode, callback);
    } catch (e) {
      if ((e as DOMException)?.name === 'InvalidStateError') {
        dbPromise = null;
        const db = await getDb();
        return await execute(db, txMode, callback);
      }
      throw e;
    }
  };
}
