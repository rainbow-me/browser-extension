import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ChromeStorageAdapter } from '../chromeStorageAdapter';

describe('ChromeStorageAdapter', () => {
  let adapter: ChromeStorageAdapter;

  afterEach(async () => {
    // Clear storage to prevent test pollution
    await Promise.all([
      chrome.storage.local.clear(),
      chrome.storage.session.clear(),
      chrome.storage.sync.clear(),
      chrome.storage.managed.clear(),
    ]);
  });

  describe('clearAll', () => {
    it('should throw an error when namespace is empty to prevent global data wipe', async () => {
      adapter = new ChromeStorageAdapter({ namespace: '', area: 'local' });

      // Add some test data to storage
      await chrome.storage.local.set({
        'test-key-1': 'value1',
        'other-key': 'value2',
        '@stores/test-key': 'value3',
      });

      // Attempting to clearAll with empty namespace should throw
      await expect(adapter.clearAll()).rejects.toThrow(
        'Cannot clear all storage with empty namespace. This would delete all storage entries. Please provide a namespace.',
      );

      // Verify that storage was not cleared
      const result = await chrome.storage.local.get(null);
      expect(result['test-key-1']).toBe('value1');
      expect(result['other-key']).toBe('value2');
      expect(result['@stores/test-key']).toBe('value3');
    });

    it('should throw an error when using default empty namespace', async () => {
      // Using default CHROME_STORAGE_NAMESPACE which is ''
      adapter = new ChromeStorageAdapter({ area: 'local' });

      await chrome.storage.local.set({
        'test-key': 'value',
        'other-key': 'value2',
      });

      await expect(adapter.clearAll()).rejects.toThrow(
        'Cannot clear all storage with empty namespace',
      );

      // Verify storage was not cleared
      const result = await chrome.storage.local.get(null);
      expect(result['test-key']).toBe('value');
      expect(result['other-key']).toBe('value2');
    });

    it('should clear only keys with the specified namespace prefix', async () => {
      const namespace = '@stores/test';
      adapter = new ChromeStorageAdapter({ namespace, area: 'local' });

      // Set keys with namespace prefix
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');

      // Set keys without namespace prefix (should not be deleted)
      await chrome.storage.local.set({
        'other-key': 'other-value',
        '@stores/other-namespace/key': 'other-namespace-value',
      });

      // Clear all keys with the namespace
      await adapter.clearAll();

      // Verify namespace keys are deleted
      const namespaceKeys = await adapter.getAllKeys();
      expect(namespaceKeys).toHaveLength(0);

      // Verify other keys are preserved
      const allStorage = await chrome.storage.local.get(null);
      expect(allStorage['other-key']).toBe('other-value');
      expect(allStorage['@stores/other-namespace/key']).toBe(
        'other-namespace-value',
      );
    });

    it('should do nothing when no keys match the namespace', async () => {
      const namespace = '@stores/test';
      adapter = new ChromeStorageAdapter({ namespace, area: 'local' });

      // Set keys without the namespace prefix
      await chrome.storage.local.set({
        'other-key': 'other-value',
      });

      // clearAll should not throw and should not delete anything
      await adapter.clearAll();

      // Verify other keys are preserved
      const allStorage = await chrome.storage.local.get(null);
      expect(allStorage['other-key']).toBe('other-value');
    });

    it('should work with different storage areas', async () => {
      const namespace = '@stores/test';
      const localAdapter = new ChromeStorageAdapter({
        namespace,
        area: 'local',
      });
      const sessionAdapter = new ChromeStorageAdapter({
        namespace,
        area: 'session',
      });

      await localAdapter.set('key1', 'local-value');
      await sessionAdapter.set('key1', 'session-value');

      await localAdapter.clearAll();
      await sessionAdapter.clearAll();

      const localKeys = await localAdapter.getAllKeys();
      const sessionKeys = await sessionAdapter.getAllKeys();

      expect(localKeys).toHaveLength(0);
      expect(sessionKeys).toHaveLength(0);
    });
  });

  describe('set and getString', () => {
    beforeEach(() => {
      adapter = new ChromeStorageAdapter({
        namespace: '@stores/test',
        area: 'local',
      });
    });

    it('should set and get string values', async () => {
      await adapter.set('test-key', 'test-value');
      const value = await adapter.getString('test-key');
      expect(value).toBe('test-value');
    });

    it('should return undefined for non-existent keys', async () => {
      const value = await adapter.getString('non-existent');
      expect(value).toBeUndefined();
    });

    it('should handle namespaced keys correctly', async () => {
      await adapter.set('key', 'value');
      const storageKey = '@stores/testkey';
      const result = await chrome.storage.local.get(storageKey);
      expect(result[storageKey]).toBe('value');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      adapter = new ChromeStorageAdapter({
        namespace: '@stores/test',
        area: 'local',
      });
    });

    it('should delete a key', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');

      await adapter.delete('key1');

      expect(await adapter.getString('key1')).toBeUndefined();
      expect(await adapter.getString('key2')).toBe('value2');
    });
  });

  describe('contains', () => {
    beforeEach(() => {
      adapter = new ChromeStorageAdapter({
        namespace: '@stores/test',
        area: 'local',
      });
    });

    it('should return true for existing keys', async () => {
      await adapter.set('key', 'value');
      expect(await adapter.contains('key')).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      expect(await adapter.contains('non-existent')).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('should throw an error when namespace is empty to prevent returning all storage keys', async () => {
      adapter = new ChromeStorageAdapter({ namespace: '', area: 'local' });

      // Add some test data to storage
      await chrome.storage.local.set({
        'test-key-1': 'value1',
        'other-key': 'value2',
        '@stores/test-key': 'value3',
      });

      // Attempting to getAllKeys with empty namespace should throw
      await expect(adapter.getAllKeys()).rejects.toThrow(
        'Cannot get all keys with empty namespace. This would return all storage entries. Please provide a namespace.',
      );
    });

    it('should throw an error when using default empty namespace', async () => {
      // Using default CHROME_STORAGE_NAMESPACE which is ''
      adapter = new ChromeStorageAdapter({ area: 'local' });

      await chrome.storage.local.set({
        'test-key': 'value',
        'other-key': 'value2',
      });

      await expect(adapter.getAllKeys()).rejects.toThrow(
        'Cannot get all keys with empty namespace',
      );
    });

    describe('with namespace', () => {
      beforeEach(() => {
        adapter = new ChromeStorageAdapter({
          namespace: '@stores/test',
          area: 'local',
        });
      });

      it('should return all keys with the namespace prefix', async () => {
        await adapter.set('key1', 'value1');
        await adapter.set('key2', 'value2');

        // Add a key without namespace prefix
        await chrome.storage.local.set({
          'other-key': 'other-value',
        });

        const keys = await adapter.getAllKeys();
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys).not.toContain('other-key');
      });

      it('should return empty array when no keys exist', async () => {
        const keys = await adapter.getAllKeys();
        expect(keys).toEqual([]);
      });
    });
  });
});
