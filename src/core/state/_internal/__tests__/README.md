# Chrome Extension Sync Engine Tests

This directory contains comprehensive unit tests for the Chrome Extension Sync Engine, which enables real-time state synchronization between multiple store instances (simulating different browser tabs, popup, options page, and background service worker).

## Test Files

### `chromeSyncEngine.test.ts`

Main test suite with 7 comprehensive tests covering:

1. **Basic bidirectional sync** - Two store instances sync state changes between each other
2. **Complex state sync with todos** - Tests sync with nested objects and arrays
3. **Rapid consecutive updates** - Ensures rapid updates are properly synchronized
4. **Selective field sync** - Verifies only specified fields are synced, while local fields remain independent
5. **Multiple stores with different keys** - Tests that different stores don't interfere with each other
6. **Concurrent store instances** - Two stores running simultaneously stay in sync through shared storage
7. **Subscription and cleanup** - Verifies proper listener cleanup and subscription management

### `mockChromeStorage.ts`

Mock implementation of the Chrome Storage API that:

- Simulates `chrome.storage.local`, `chrome.storage.session`, `chrome.storage.sync`, and `chrome.storage.managed`
- Provides a single shared storage source of truth (like Chrome's actual storage)
- Properly fires storage change events to listeners
- Supports all standard Chrome Storage API methods (`get`, `set`, `remove`, `clear`)

## Key Features Tested

### Shared Storage Source of Truth

The mock storage simulates Chrome's storage behavior where all tabs/contexts share the same storage backend. When one store instance updates its state, the change is:

1. Written to the shared mock storage
2. Broadcast as a storage change event
3. Picked up by other store instances' sync engines
4. Applied to their local state

### Two-Way Sync

Tests verify that:

- Updates from Store A sync to Store B
- Updates from Store B sync to Store A
- Multiple rapid updates are handled correctly
- Different stores with different keys don't interfere

### Field-Level Sync Control

Tests demonstrate selective field synchronization:

- Some fields can be synced across instances
- Other fields remain local to each instance
- This enables hybrid local/synced state management

## Running Tests

```bash
# Run tests once
pnpm test -- --run

# Run tests in watch mode
pnpm test

# Run with verbose output
pnpm test -- --reporter=verbose
```

## Test Configuration

The tests use Vitest with a single-thread pool configuration to avoid worker cleanup issues. See `vitest.config.ts` for details.

## Implementation Notes

### Async Storage Timing

The Chrome Storage API is asynchronous. Tests use `waitForSync()` and `waitForHydration()` helper functions to ensure async operations complete before assertions.

### Mock Chrome Global

Tests set up a mock `chrome` global object that simulates the Chrome extension API. This allows the sync engine and storage adapter to work in a Node.js test environment.

### Cleanup

Each test properly cleans up:

- Clears storage between tests
- Removes event listeners
- Prevents test pollution and memory leaks
