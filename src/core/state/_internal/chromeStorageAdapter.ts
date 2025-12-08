import type { AsyncStorageInterface } from 'stores';

export const CHROME_STORAGE_NAMESPACE = '';
const ENABLE_LOGS = false;

export type AreaName = keyof Pick<
  typeof chrome.storage,
  'local' | 'managed' | 'session' | 'sync'
>;

export type ChromeStorageAdapterOptions = {
  area?: AreaName;
  namespace?: string;
};

export class ChromeStorageAdapter implements AsyncStorageInterface {
  readonly area: 'local' | 'session' | 'sync' | 'managed';
  readonly async = true;
  readonly namespace: string;
  private _isPromiseBased: boolean | null = null;

  constructor(options?: ChromeStorageAdapterOptions) {
    this.area = options?.area ?? 'local';
    this.namespace = options?.namespace ?? CHROME_STORAGE_NAMESPACE;
  }

  async clearAll(): Promise<void> {
    const storage = this.ensureStorage();
    if (!storage) return;
    const prefix = this.namespacePrefix();
    // Prevent accidental deletion of all storage when namespace is empty
    // An empty prefix would match all keys, causing data loss
    if (!prefix) {
      throw new Error(
        'Cannot clear all storage with empty namespace. This would delete all storage entries. Please provide a namespace.',
      );
    }
    const keys = await this.listPrefixedKeys(storage, prefix);
    if (!keys.length) return;
    await this.execute(storage, (done) => storage.remove(keys, done));
  }

  async contains(key: string): Promise<boolean> {
    const storage = this.ensureStorage();
    if (!storage) return false;
    const storageKey = this.toStorageKey(key);
    const result = await this.getFromStorage(storage, storageKey);
    return (
      Object.prototype.hasOwnProperty.call(result, storageKey) &&
      result[storageKey] !== undefined
    );
  }

  async delete(key: string): Promise<void> {
    const storage = this.ensureStorage();
    if (!storage) return;
    const storageKey = this.toStorageKey(key);
    await this.execute(storage, (done) => storage.remove(storageKey, done));
  }

  async getAllKeys(): Promise<string[]> {
    const storage = this.ensureStorage();
    if (!storage) return [];
    const prefix = this.namespacePrefix();
    // Prevent returning all storage keys when namespace is empty
    // An empty prefix would match all keys, violating namespace isolation
    if (!prefix) {
      throw new Error(
        'Cannot get all keys with empty namespace. This would return all storage entries. Please provide a namespace.',
      );
    }
    const result = await this.getFromStorage(storage, null);
    return Object.keys(result)
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  async getString(key: string): Promise<string | undefined> {
    const storage = this.ensureStorage();
    if (!storage) return undefined;
    const storageKey = this.toStorageKey(key);
    const result = await this.getFromStorage(storage, storageKey);
    const value = result[storageKey];
    const hasValue = typeof value === 'string';
    if (ENABLE_LOGS)
      console.log(
        `[ChromeStorageAdapter] getString("${key}"): ${
          hasValue ? 'FOUND' : 'NOT FOUND'
        }`,
        hasValue ? JSON.parse(value) : null,
      );
    return hasValue ? value : undefined;
  }

  async set(key: string, value: string): Promise<void> {
    if (ENABLE_LOGS)
      console.log('[💾 storage.set 💾] Persisting value for key:', key);
    const storage = this.ensureStorage();
    if (!storage) return;
    const storageKey = this.toStorageKey(key);
    await this.execute(storage, (done) =>
      storage.set({ [storageKey]: value }, done),
    );
  }

  private ensureStorage(): chrome.storage.StorageArea | null {
    return getChromeStorageArea(this.area);
  }

  private namespacePrefix(): string {
    return this.namespace ?? '';
  }

  private toStorageKey(key: string): string {
    return `${this.namespacePrefix()}${key}`;
  }

  private async listPrefixedKeys(
    storage: chrome.storage.StorageArea,
    prefix: string,
  ): Promise<string[]> {
    const result = await this.getFromStorage(storage, null);
    return Object.keys(result).filter((key) => key.startsWith(prefix));
  }

  private isPromiseBased(storage: chrome.storage.StorageArea): boolean {
    if (this._isPromiseBased === null) {
      try {
        // Detect API type once by checking if get() returns a Promise
        const result = storage.get(null);
        this._isPromiseBased = result instanceof Promise;
      } catch {
        // If detection fails, default to callback-based API (real Chrome)
        this._isPromiseBased = false;
      }
    }
    return this._isPromiseBased;
  }

  private async getFromStorage(
    storage: chrome.storage.StorageArea,
    keys: string | string[] | null,
  ): Promise<Record<string, unknown>> {
    if (this.isPromiseBased(storage)) {
      // Promise-based API (fakeBrowser)
      const result = storage.get(keys);
      if (result instanceof Promise) {
        return await result;
      }
      // Fall through to callback-based API if detection was wrong
    }
    // Callback-based API (real Chrome)
    return await this.getFromStorageCallback(storage, keys);
  }

  private getFromStorageCallback(
    storage: chrome.storage.StorageArea,
    keys: string | string[] | null,
  ): Promise<Record<string, unknown>> {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      try {
        storage.get(keys, (items) => {
          const runtimeError = getRuntimeError();
          if (runtimeError) {
            reject(runtimeError);
            return;
          }
          resolve(items);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async execute(
    storage: chrome.storage.StorageArea,
    operation: (done: () => void) => void,
  ): Promise<void> {
    if (this.isPromiseBased(storage)) {
      // Promise-based API (fakeBrowser) - operation returns a Promise
      const promise = operation(() => {
        // Callback ignored for Promise-based API
      }) as unknown;
      if (promise instanceof Promise) {
        await promise;
      }
      const runtimeError = getRuntimeError();
      if (runtimeError) {
        throw runtimeError;
      }
      return;
    }
    // Callback-based API (real Chrome)
    await new Promise<void>((resolve, reject) => {
      try {
        operation(() => {
          const runtimeError = getRuntimeError();
          if (runtimeError) {
            reject(runtimeError);
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

function getChromeStorageArea(
  area: AreaName,
): chrome.storage.StorageArea | null {
  if (typeof chrome === 'undefined' || !chrome.storage) return null;
  return chrome.storage[area] ?? null;
}

function getRuntimeError(): Error | null {
  if (
    typeof chrome === 'undefined' ||
    !chrome.runtime ||
    !chrome.runtime.lastError
  )
    return null;
  const message = chrome.runtime.lastError.message;
  if (!message) return null;
  return new Error(message);
}
