/**
 * Mock implementation of Chrome Storage API
 * Simulates a single shared storage area that can be used across multiple "processes"
 */

type MockChromeAPI = {
  storage: {
    local: MockStorageArea;
    session: MockStorageArea;
    sync: MockStorageArea;
    managed: MockStorageArea;
    onChanged: MockStorageChangedEvent;
  };
  runtime: {
    lastError: undefined;
  };
};

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: 'local' | 'session' | 'sync' | 'managed',
) => void;

class MockStorageArea {
  private data: Record<string, unknown> = {};
  private listeners: Set<StorageChangeListener> = new Set();
  public readonly QUOTA_BYTES = 5242880;

  constructor(
    private readonly areaName: 'local' | 'session' | 'sync' | 'managed',
    private readonly onChanged: {
      addListener: (callback: StorageChangeListener) => void;
      removeListener: (callback: StorageChangeListener) => void;
    },
  ) {}

  private notifyAndResolve(
    changes: Record<string, chrome.storage.StorageChange>,
    callback: (() => void) | undefined,
    resolve: () => void,
  ): void {
    // Notify listeners and resolve asynchronously
    queueMicrotask(() => {
      this.listeners.forEach((listener) => {
        listener(changes, this.areaName);
      });
      callback?.();
      resolve();
    });
  }

  get(
    keys?: string | string[] | Record<string, unknown> | null,
    callback?: (items: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      let result: Record<string, unknown> = {};

      if (keys === null || keys === undefined) {
        // Return all items
        result = { ...this.data };
      } else if (typeof keys === 'string') {
        // Single key
        if (keys in this.data) {
          result[keys] = this.data[keys];
        }
      } else if (Array.isArray(keys)) {
        // Array of keys
        for (const key of keys) {
          if (key in this.data) {
            result[key] = this.data[key];
          }
        }
      } else {
        // Object with default values
        for (const [key, defaultValue] of Object.entries(keys)) {
          result[key] = key in this.data ? this.data[key] : defaultValue;
        }
      }

      if (callback) {
        callback(result);
      }
      resolve(result);
    });
  }

  set(items: Record<string, unknown>, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      const changes: Record<string, chrome.storage.StorageChange> = {};

      for (const [key, newValue] of Object.entries(items)) {
        const oldValue = this.data[key];
        this.data[key] = newValue;

        changes[key] = {
          oldValue,
          newValue,
        };
      }

      this.notifyAndResolve(changes, callback, resolve);
    });
  }

  remove(keys: string | string[], callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const changes: Record<string, chrome.storage.StorageChange> = {};

      for (const key of keysArray) {
        if (key in this.data) {
          changes[key] = {
            oldValue: this.data[key],
            newValue: undefined,
          };
          delete this.data[key];
        }
      }

      this.notifyAndResolve(changes, callback, resolve);
    });
  }

  clear(callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      const changes: Record<string, chrome.storage.StorageChange> = {};

      for (const [key, oldValue] of Object.entries(this.data)) {
        changes[key] = {
          oldValue,
          newValue: undefined,
        };
      }

      this.data = {};

      this.notifyAndResolve(changes, callback, resolve);
    });
  }

  getBytesInUse(
    keys?: string | string[] | null,
    callback?: (bytesInUse: number) => void,
  ): Promise<number> {
    return new Promise((resolve) => {
      // Simple mock implementation
      const bytesInUse = JSON.stringify(this.data).length;
      if (callback) {
        callback(bytesInUse);
      }
      resolve(bytesInUse);
    });
  }

  setAccessLevel(
    accessOptions: { accessLevel: chrome.storage.AccessLevel },
    callback?: () => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (callback) {
        callback();
      }
      resolve();
    });
  }

  registerListener(listener: StorageChangeListener): void {
    this.listeners.add(listener);
  }

  unregisterListener(listener: StorageChangeListener): void {
    this.listeners.delete(listener);
  }
}

class MockStorageChangedEvent {
  private changeListeners: Set<StorageChangeListener> = new Set();

  constructor(
    private localArea: MockStorageArea,
    private sessionArea: MockStorageArea,
    private syncArea: MockStorageArea,
    private managedArea: MockStorageArea,
  ) {}

  addListener(callback: StorageChangeListener): void {
    this.changeListeners.add(callback);
    this.localArea.registerListener(callback);
    this.sessionArea.registerListener(callback);
    this.syncArea.registerListener(callback);
    this.managedArea.registerListener(callback);
  }

  removeListener(callback: StorageChangeListener): void {
    this.changeListeners.delete(callback);
    this.localArea.unregisterListener(callback);
    this.sessionArea.unregisterListener(callback);
    this.syncArea.unregisterListener(callback);
    this.managedArea.unregisterListener(callback);
  }

  hasListener(callback: StorageChangeListener): boolean {
    return this.changeListeners.has(callback);
  }

  hasListeners(): boolean {
    return this.changeListeners.size > 0;
  }

  cleanup(): void {
    this.changeListeners.clear();
  }

  // ========== Unimplemented Methods ==========

  addRules(): void {
    throw new Error('addRules is not implemented');
  }

  getRules(): void {
    throw new Error('getRules is not implemented');
  }

  removeRules(): void {
    throw new Error('removeRules is not implemented');
  }
}

export class MockChromeStorage {
  public readonly local: MockStorageArea;
  public readonly session: MockStorageArea;
  public readonly sync: MockStorageArea;
  public readonly managed: MockStorageArea;
  public readonly onChanged: MockStorageChangedEvent;

  constructor() {
    // Create onChanged first so we can pass it to storage areas
    const onChangedStub = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      addListener: (_callback: StorageChangeListener) => {
        // Will be properly wired through MockStorageChangedEvent
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      removeListener: (_callback: StorageChangeListener) => {
        // Will be properly wired through MockStorageChangedEvent
      },
    };

    this.local = new MockStorageArea('local', onChangedStub);
    this.session = new MockStorageArea('session', onChangedStub);
    this.sync = new MockStorageArea('sync', onChangedStub);
    this.managed = new MockStorageArea('managed', onChangedStub);
    this.onChanged = new MockStorageChangedEvent(
      this.local,
      this.session,
      this.sync,
      this.managed,
    );
  }

  cleanup(): void {
    this.onChanged.cleanup();
  }
}

let globalChromeInstance: MockChromeAPI | undefined;

export function setupMockChrome(storage: MockChromeStorage): void {
  // Store the current global instance before overwriting (if it exists)
  if (
    typeof globalThis.chrome !== 'undefined' &&
    globalChromeInstance === undefined
  ) {
    globalChromeInstance = globalThis.chrome as unknown as MockChromeAPI;
  }

  const mockChrome: MockChromeAPI = {
    storage: {
      local: storage.local,
      session: storage.session,
      sync: storage.sync,
      managed: storage.managed,
      onChanged: storage.onChanged,
    },
    runtime: {
      lastError: undefined,
    },
  };
  Object.assign(globalThis, { chrome: mockChrome });
}

export function cleanupMockChrome(): void {
  Reflect.deleteProperty(globalThis, 'chrome');
}

export function restoreGlobalChrome(): void {
  if (globalChromeInstance) {
    Object.assign(globalThis, { chrome: globalChromeInstance });
  }
}
