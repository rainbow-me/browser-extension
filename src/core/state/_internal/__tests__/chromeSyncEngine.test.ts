import { createBaseStore } from 'stores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MockChromeStorage,
  cleanupMockChrome,
  restoreGlobalChrome,
  setupMockChrome,
} from '~/test/mock/chromeStorage';

import { ChromeExtensionSyncEngine } from '../chromeExtensionSyncEngine';
import { ChromeStorageAdapter } from '../chromeStorageAdapter';

// Wait for pending microtasks to complete (for storage events to propagate)
const waitForMicrotasks = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe('ChromeExtensionSyncEngine', () => {
  let mockStorage: MockChromeStorage;
  let storageAdapter1: ChromeStorageAdapter;
  let storageAdapter2: ChromeStorageAdapter;
  let syncEngine1: ChromeExtensionSyncEngine;
  let syncEngine2: ChromeExtensionSyncEngine;

  beforeEach(() => {
    // Create a single shared mock storage (source of truth)
    mockStorage = new MockChromeStorage();
    setupMockChrome(mockStorage);

    // Create two separate storage adapters pointing to the same underlying storage
    const namespace = '@stores/test-sync';
    storageAdapter1 = new ChromeStorageAdapter({ namespace, area: 'local' });
    storageAdapter2 = new ChromeStorageAdapter({ namespace, area: 'local' });

    // Create two separate sync engines (simulating two different processes)
    syncEngine1 = new ChromeExtensionSyncEngine({ storage: storageAdapter1 });
    syncEngine2 = new ChromeExtensionSyncEngine({ storage: storageAdapter2 });
  });

  afterEach(async () => {
    // Clear storage to prevent test pollution
    await mockStorage.local.clear();
    // Clean up listeners to prevent memory leaks
    mockStorage.cleanup();
    cleanupMockChrome();
    // Restore global chrome instance for other tests
    restoreGlobalChrome();
  });

  it('should sync state changes between two store instances', async () => {
    type CounterState = {
      count: number;
      increment: () => void;
      decrement: () => void;
    };

    // Create two store instances (simulating two different processes)
    const store1 = createBaseStore<CounterState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'counter-store',
        sync: { engine: syncEngine1, fields: ['count'] },
      },
    );

    const store2 = createBaseStore<CounterState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'counter-store',
        sync: { engine: syncEngine2, fields: ['count'] },
      },
    );

    await Promise.all([
      store1.persist.hydrationPromise(),
      store2.persist.hydrationPromise(),
    ]);

    // Initial state should be the same
    expect(store1.getState().count).toBe(0);
    expect(store2.getState().count).toBe(0);

    // Update store1
    store1.getState().increment();
    expect(store1.getState().count).toBe(1);

    // Wait for sync to propagate
    await waitForMicrotasks();

    // Store2 should receive the update
    expect(store2.getState().count).toBe(1);

    // Update store2
    store2.getState().increment();
    store2.getState().increment();
    expect(store2.getState().count).toBe(3);

    // Wait for sync to propagate
    await waitForMicrotasks();

    // Store1 should receive the updates
    expect(store1.getState().count).toBe(3);
  });

  it('should handle bidirectional sync with complex state', async () => {
    type TodoState = {
      todos: Array<{ id: string; text: string; completed: boolean }>;
      filter: 'all' | 'active' | 'completed';
      addTodo: (text: string) => void;
      toggleTodo: (id: string) => void;
      setFilter: (filter: 'all' | 'active' | 'completed') => void;
    };

    const createTodoStore = (
      storage: ChromeStorageAdapter,
      syncEngine: ChromeExtensionSyncEngine,
    ) =>
      createBaseStore<TodoState>(
        (set) => ({
          todos: [],
          filter: 'all',
          addTodo: (text) =>
            set((state) => ({
              todos: [
                ...state.todos,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  text,
                  completed: false,
                },
              ],
            })),
          toggleTodo: (id) =>
            set((state) => ({
              todos: state.todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo,
              ),
            })),
          setFilter: (filter) => set({ filter }),
        }),
        {
          storage,
          storageKey: 'todo-store',
          sync: { engine: syncEngine, fields: ['todos', 'filter'] },
        },
      );

    const todoStore1 = createTodoStore(storageAdapter1, syncEngine1);
    const todoStore2 = createTodoStore(storageAdapter2, syncEngine2);

    await Promise.all([
      todoStore1.persist.hydrationPromise(),
      todoStore2.persist.hydrationPromise(),
    ]);

    // Add a todo from store1
    todoStore1.getState().addTodo('Buy groceries');
    expect(todoStore1.getState().todos).toHaveLength(1);
    expect(todoStore1.getState().todos[0].text).toBe('Buy groceries');

    await waitForMicrotasks();

    // Store2 should receive the new todo
    expect(todoStore2.getState().todos).toHaveLength(1);
    expect(todoStore2.getState().todos[0].text).toBe('Buy groceries');
    expect(todoStore2.getState().todos[0].id).toBe(
      todoStore1.getState().todos[0].id,
    );

    // Add another todo from store2
    todoStore2.getState().addTodo('Walk the dog');
    expect(todoStore2.getState().todos).toHaveLength(2);

    await waitForMicrotasks();

    // Store1 should receive the update
    expect(todoStore1.getState().todos).toHaveLength(2);
    const todo2 = todoStore1
      .getState()
      .todos.find((t) => t.text === 'Walk the dog');
    expect(todo2).toBeDefined();
    expect(todo2?.completed).toBe(false);

    // Toggle todo from store1
    if (todo2) {
      todoStore1.getState().toggleTodo(todo2.id);
      expect(
        todoStore1.getState().todos.find((t) => t.id === todo2.id)?.completed,
      ).toBe(true);

      await waitForMicrotasks();

      // Store2 should receive the toggle
      expect(
        todoStore2.getState().todos.find((t) => t.id === todo2.id)?.completed,
      ).toBe(true);
    }

    // Change filter from store2
    todoStore2.getState().setFilter('completed');
    expect(todoStore2.getState().filter).toBe('completed');

    await waitForMicrotasks();

    // Store1 should receive the filter change
    expect(todoStore1.getState().filter).toBe('completed');
  });

  it('should handle rapid consecutive updates', async () => {
    type CounterState = {
      count: number;
      increment: () => void;
    };

    const store1 = createBaseStore<CounterState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'rapid-counter',
        sync: { engine: syncEngine1, fields: ['count'] },
      },
    );

    const store2 = createBaseStore<CounterState>(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'rapid-counter',
        sync: { engine: syncEngine2, fields: ['count'] },
      },
    );

    await Promise.all([
      store1.persist.hydrationPromise(),
      store2.persist.hydrationPromise(),
    ]);

    // Perform rapid updates from store1
    for (let i = 0; i < 5; i++) {
      store1.getState().increment();
    }

    expect(store1.getState().count).toBe(5);

    // Wait for all updates to propagate
    await waitForMicrotasks();

    // Store2 should eventually have the final count
    expect(store2.getState().count).toBe(5);
  });

  it('should sync only specified fields', async () => {
    type MixedState = {
      syncedField: string;
      localField: string;
      updateSynced: (value: string) => void;
      updateLocal: (value: string) => void;
    };

    const store1 = createBaseStore<MixedState>(
      (set) => ({
        syncedField: 'initial',
        localField: 'local1',
        updateSynced: (value) => set({ syncedField: value }),
        updateLocal: (value) => set({ localField: value }),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'mixed-store',
        sync: { engine: syncEngine1, fields: ['syncedField'] }, // Only sync syncedField
      },
    );

    const store2 = createBaseStore<MixedState>(
      (set) => ({
        syncedField: 'initial',
        localField: 'local2',
        updateSynced: (value) => set({ syncedField: value }),
        updateLocal: (value) => set({ localField: value }),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'mixed-store',
        sync: { engine: syncEngine2, fields: ['syncedField'] }, // Only sync syncedField
      },
    );

    await Promise.all([
      store1.persist.hydrationPromise(),
      store2.persist.hydrationPromise(),
    ]);

    // Update synced field in store1
    store1.getState().updateSynced('synced-value');
    expect(store1.getState().syncedField).toBe('synced-value');

    await waitForMicrotasks();

    // Store2 should receive the synced field update
    expect(store2.getState().syncedField).toBe('synced-value');

    // Update local field in store1
    store1.getState().updateLocal('local1-updated');
    expect(store1.getState().localField).toBe('local1-updated');

    await waitForMicrotasks();

    // Store2's local field should NOT change
    expect(store2.getState().localField).toBe('local2');

    // Update local field in store2
    store2.getState().updateLocal('local2-updated');
    expect(store2.getState().localField).toBe('local2-updated');

    await waitForMicrotasks();

    // Store1's local field should NOT change
    expect(store1.getState().localField).toBe('local1-updated');
  });

  it('should handle multiple stores with different keys', async () => {
    type StateA = {
      valueA: number;
      updateA: (value: number) => void;
    };

    type StateB = {
      valueB: string;
      updateB: (value: string) => void;
    };

    // Create two different stores with different keys
    const storeA1 = createBaseStore<StateA>(
      (set) => ({
        valueA: 0,
        updateA: (value) => set({ valueA: value }),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'store-a',
        sync: { engine: syncEngine1, fields: ['valueA'] },
      },
    );

    const storeB1 = createBaseStore<StateB>(
      (set) => ({
        valueB: 'initial',
        updateB: (value) => set({ valueB: value }),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'store-b',
        sync: { engine: syncEngine1, fields: ['valueB'] },
      },
    );

    const storeA2 = createBaseStore<StateA>(
      (set) => ({
        valueA: 0,
        updateA: (value) => set({ valueA: value }),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'store-a',
        sync: { engine: syncEngine2, fields: ['valueA'] },
      },
    );

    const storeB2 = createBaseStore<StateB>(
      (set) => ({
        valueB: 'initial',
        updateB: (value) => set({ valueB: value }),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'store-b',
        sync: { engine: syncEngine2, fields: ['valueB'] },
      },
    );

    await Promise.all([
      storeA1.persist.hydrationPromise(),
      storeB1.persist.hydrationPromise(),
      storeA2.persist.hydrationPromise(),
      storeB2.persist.hydrationPromise(),
    ]);

    // Update storeA1
    storeA1.getState().updateA(42);
    expect(storeA1.getState().valueA).toBe(42);

    await waitForMicrotasks();

    // Only storeA2 should receive the update, not storeB2
    expect(storeA2.getState().valueA).toBe(42);
    expect(storeB2.getState().valueB).toBe('initial');

    // Update storeB2
    storeB2.getState().updateB('updated');
    expect(storeB2.getState().valueB).toBe('updated');

    await waitForMicrotasks();

    // Only storeB1 should receive the update, not storeA1
    expect(storeB1.getState().valueB).toBe('updated');
    expect(storeA1.getState().valueA).toBe(42); // Should remain unchanged
  });

  it('should sync between two already-running store instances sharing storage', async () => {
    type PersistedState = {
      counter: number;
      message: string;
      increment: () => void;
      setMessage: (msg: string) => void;
    };

    // Create two stores simultaneously (simulating two tabs/processes running at the same time)
    const store1 = createBaseStore<PersistedState>(
      (set) => ({
        counter: 0,
        message: 'hello',
        increment: () => set((state) => ({ counter: state.counter + 1 })),
        setMessage: (msg) => set({ message: msg }),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'concurrent-store',
        sync: { engine: syncEngine1, fields: ['counter', 'message'] },
      },
    );

    const store2 = createBaseStore<PersistedState>(
      (set) => ({
        counter: 0,
        message: 'hello',
        increment: () => set((state) => ({ counter: state.counter + 1 })),
        setMessage: (msg) => set({ message: msg }),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'concurrent-store',
        sync: { engine: syncEngine2, fields: ['counter', 'message'] },
      },
    );

    await Promise.all([
      store1.persist.hydrationPromise(),
      store2.persist.hydrationPromise(),
    ]);

    // Both should start with the same initial state
    expect(store1.getState().counter).toBe(0);
    expect(store2.getState().counter).toBe(0);

    // Update from store1
    store1.getState().increment();
    store1.getState().increment();
    store1.getState().setMessage('from store1');

    expect(store1.getState().counter).toBe(2);
    expect(store1.getState().message).toBe('from store1');

    // Wait for sync
    await waitForMicrotasks();

    // Store2 should receive the updates
    expect(store2.getState().counter).toBe(2);
    expect(store2.getState().message).toBe('from store1');

    // Now update from store2
    store2.getState().increment();
    store2.getState().setMessage('from store2');

    expect(store2.getState().counter).toBe(3);
    expect(store2.getState().message).toBe('from store2');

    // Wait for sync
    await waitForMicrotasks();

    // Store1 should receive the updates
    expect(store1.getState().counter).toBe(3);
    expect(store1.getState().message).toBe('from store2');
  });

  it('should handle subscription and listener cleanup', async () => {
    type SimpleState = {
      value: number;
      setValue: (v: number) => void;
    };

    const store1 = createBaseStore<SimpleState>(
      (set) => ({
        value: 0,
        setValue: (v) => set({ value: v }),
      }),
      {
        storage: storageAdapter1,
        storageKey: 'cleanup-store',
        sync: { engine: syncEngine1, fields: ['value'] },
      },
    );

    const store2 = createBaseStore<SimpleState>(
      (set) => ({
        value: 0,
        setValue: (v) => set({ value: v }),
      }),
      {
        storage: storageAdapter2,
        storageKey: 'cleanup-store',
        sync: { engine: syncEngine2, fields: ['value'] },
      },
    );

    await Promise.all([
      store1.persist.hydrationPromise(),
      store2.persist.hydrationPromise(),
    ]);

    // Track subscription calls
    const subscriber = vi.fn();
    const unsubscribe = store2.subscribe(subscriber);

    // Update store1
    store1.getState().setValue(100);

    await waitForMicrotasks();

    // Subscriber should be called when store2 receives the update
    expect(subscriber).toHaveBeenCalled();
    expect(store2.getState().value).toBe(100);

    // Unsubscribe
    unsubscribe();

    // Update again
    store1.getState().setValue(200);

    await waitForMicrotasks();

    // Store2 should still be synced (sync is independent of subscriptions)
    expect(store2.getState().value).toBe(200);
  });
});
