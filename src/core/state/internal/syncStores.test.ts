import { createBaseStore } from 'stores';
import { describe, expect, it } from 'vitest';

import { createExtensionStoreOptions } from '../_internal';

import { createRainbowStore } from './createRainbowStore';
import { requiresManualSync } from './syncStores';

describe('requiresManualSync', () => {
  it('should return false for stores with automatic sync (createBaseStore + createExtensionStoreOptions)', () => {
    // Create a simple store using the new pattern (automatic sync)
    const useTestStore = createBaseStore(
      () => ({
        value: 0,
      }),
      createExtensionStoreOptions({
        storageKey: 'test-store-auto',
        version: 0,
      }),
    );

    // Get the store instance
    const store = useTestStore as unknown as ReturnType<typeof useTestStore>;

    expect(
      requiresManualSync(
        store as unknown as Parameters<typeof requiresManualSync>[0],
      ),
    ).toBe(false);
  });

  it('should return true for stores without automatic sync (createRainbowStore)', () => {
    // Create a simple store using the old pattern (manual sync)
    const useTestStore = createRainbowStore(
      () => ({
        value: 0,
      }),
      {
        storageKey: 'test-store-manual',
        version: 0,
      },
    );

    // Get the store instance
    const store = useTestStore as unknown as ReturnType<typeof useTestStore>;

    expect(
      requiresManualSync(
        store as unknown as Parameters<typeof requiresManualSync>[0],
      ),
    ).toBe(true);
  });
});
