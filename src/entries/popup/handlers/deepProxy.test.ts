/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';

import { createDeepProxy } from './deepProxy';

describe('createDeepProxy', () => {
  describe('Basic functionality', () => {
    it('should proxy simple object properties', () => {
      const obj = { name: 'test', value: 42 };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.name).toBe('test');
      expect(proxy.value).toBe(42);
    });

    it('should handle dynamic updates to getter', () => {
      let obj = { name: 'initial' };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.name).toBe('initial');

      obj = { name: 'updated' };
      expect(proxy.name).toBe('updated');
    });

    it('should handle function calls via apply handler', () => {
      const fn = vi.fn().mockReturnValue('result');
      const proxy = createDeepProxy(() => fn);

      const result = proxy('arg1', 'arg2');
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle method calls on objects', () => {
      const obj = {
        value: 10,
        multiply: function (factor: number) {
          return this.value * factor;
        },
      };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.multiply(3)).toBe(30);
    });
  });

  describe('Primitive values handling', () => {
    const primitiveValues: { name: string; value: unknown }[] = [
      { name: 'string', value: 'hello' },
      { name: 'number', value: 42 },
      { name: 'boolean true', value: true },
      { name: 'boolean false', value: false },
      { name: 'undefined', value: undefined },
      { name: 'null', value: null },
      { name: 'symbol', value: Symbol('test') },
      { name: 'bigint', value: BigInt(123) },
    ];

    it.each(primitiveValues)('should handle $name values', ({ value }) => {
      const obj = { prop: value };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.prop).toBe(value);
    });
  });

  describe('Special object types', () => {
    it('should handle arrays', () => {
      const obj = { arr: [1, 2, 3] };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.arr[0]).toBe(1);
      expect(proxy.arr.length).toBe(3);
      expect(typeof proxy.arr).toBe('object');
    });

    it('should handle dates (special objects returned directly)', () => {
      const date = new Date('2023-01-01');
      const obj = { date };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.date).toBe(date);
      expect(proxy.date).toBeInstanceOf(Date);
      expect(proxy.date.getUTCFullYear()).toBe(2023);
    });

    it('should handle regular expressions (special objects returned directly)', () => {
      const regex = /test/g;
      const obj = { regex };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.regex).toBe(regex);
      expect(proxy.regex).toBeInstanceOf(RegExp);
      expect(proxy.regex.test('test')).toBe(true);
      expect(proxy.regex.source).toBe('test');
      expect(proxy.regex.flags).toBe('g');
    });

    it('should handle functions as properties', () => {
      const fn = vi.fn().mockReturnValue('test');
      const obj = { fn };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.fn).toBe(fn);
      expect(proxy.fn()).toBe('test');
    });

    it('should handle Maps as special objects', () => {
      const map = new Map([['key', 'value']]);
      const obj = { map };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.map).toBe(map);
      expect(proxy.map.get('key')).toBe('value');
      expect(proxy.map.size).toBe(1);
    });

    it('should handle Sets as special objects', () => {
      const set = new Set([1, 2, 3]);
      const obj = { set };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.set).toBe(set);
      expect(proxy.set.has(2)).toBe(true);
      expect(proxy.set.size).toBe(3);
    });

    it('should handle Errors as special objects', () => {
      const error = new Error('test error');
      const obj = { error };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.error).toBe(error);
      expect(proxy.error.message).toBe('test error');
      expect(proxy.error).toBeInstanceOf(Error);
    });

    it('should handle Promises as special objects', () => {
      const promise = Promise.resolve('test');
      const obj = { promise };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.promise).toBe(promise);
      expect(proxy.promise).toBeInstanceOf(Promise);
    });

    it('should handle TypedArrays as special objects', () => {
      const uint8Array = new Uint8Array([1, 2, 3]);
      const obj = { uint8Array };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.uint8Array).toBe(uint8Array);
      expect(proxy.uint8Array[0]).toBe(1);
      expect(proxy.uint8Array.length).toBe(3);
    });
  });

  describe('Nested object matrix testing', () => {
    const nestingLevels = [1, 2, 3, 4, 5] as const;
    const objectTypes = [
      { name: 'plain object', factory: () => ({ value: 'test' }) },
      {
        name: 'object with method',
        factory: () => ({ getValue: () => 'method-result' }),
      },
      { name: 'object with array', factory: () => ({ items: [1, 2, 3] }) },
      {
        name: 'mixed object',
        factory: () => ({ str: 'text', num: 42, nested: { deep: true } }),
      },
    ] as const;

    nestingLevels.forEach((level) => {
      objectTypes.forEach(({ name, factory }) => {
        it(`should handle ${name} at nesting level ${level}`, () => {
          const leaf = factory();
          let current: any = leaf;

          for (let i = level - 1; i > 0; i--) {
            const parent: Record<string, unknown> = { [`level${i}`]: current };
            current = parent;
          }

          const rootObj = { root: current };
          const proxy = createDeepProxy(() => rootObj);

          let target: any = proxy.root;
          for (let i = 1; i < level; i++) {
            target = target[`level${i}`];
          }

          if (name === 'plain object') {
            expect(target.value).toBe('test');
          } else if (name === 'object with method') {
            expect(target.getValue()).toBe('method-result');
          } else if (name === 'object with array') {
            expect(target.items[0]).toBe(1);
            expect(target.items.length).toBe(3);
          } else if (name === 'mixed object') {
            expect(target.str).toBe('text');
            expect(target.num).toBe(42);
            expect(target.nested.deep).toBe(true);
          }
        });
      });
    });
  });

  describe('Deep nesting with dynamic updates', () => {
    it('should handle updates at all nesting levels', () => {
      const deepObj: any = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: { value: 'initial' },
              },
            },
          },
        },
      };

      const proxy = createDeepProxy(() => deepObj);

      expect(proxy.level1.level2.level3.level4.level5.value).toBe('initial');

      deepObj.level1.level2.level3.level4.level5.value = 'updated';
      expect(proxy.level1.level2.level3.level4.level5.value).toBe('updated');

      deepObj.level1.level2 = { newProp: 'replaced' };
      expect(proxy.level1.level2.newProp).toBe('replaced');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle getter that throws an error', () => {
      const errorGetter = (): any => {
        throw new Error('Getter error');
      };

      const proxy = createDeepProxy(errorGetter);
      expect(() => proxy.anyProp).toThrow('Getter error');
    });

    it('should handle getter returning null', () => {
      const proxy = createDeepProxy(() => null as any);

      expect(() => proxy.anyProp).toThrow();
    });

    it('should handle getter returning undefined', () => {
      const proxy = createDeepProxy(() => undefined as any);

      expect(() => proxy.anyProp).toThrow();
    });

    it('should handle accessing non-existent properties', () => {
      const obj: any = { existing: 'value' };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.nonExistent).toBeUndefined();
    });

    it('should handle circular references', () => {
      const obj: any = { name: 'circular' };
      obj.self = obj;

      const proxy = createDeepProxy(() => obj);

      expect(proxy.name).toBe('circular');
      expect(proxy.self.name).toBe('circular');
      expect(proxy.self.self.name).toBe('circular');
    });

    it('should handle objects with null prototype', () => {
      const obj = Object.create(null) as { prop: string };
      obj.prop = 'value';

      const proxy = createDeepProxy(() => ({ nullProto: obj }));

      expect(proxy.nullProto.prop).toBe('value');
    });

    it('should handle frozen objects', () => {
      const frozenObj = Object.freeze({ frozen: true });
      const proxy = createDeepProxy(() => ({ obj: frozenObj }));

      expect(proxy.obj.frozen).toBe(true);
    });

    it('should handle sealed objects', () => {
      const sealedObj = Object.seal({ sealed: true });
      const proxy = createDeepProxy(() => ({ obj: sealedObj }));

      expect(proxy.obj.sealed).toBe(true);
    });
  });

  describe('Function proxy behavior', () => {
    it('should create function proxy when getter returns function', () => {
      const fn = vi.fn().mockReturnValue('function-result');
      const proxy = createDeepProxy(() => fn);

      expect(typeof proxy).toBe('function');
    });

    it('should handle function with properties', () => {
      const fn = vi.fn().mockReturnValue('result') as any;
      fn.customProp = 'custom-value';
      fn.nested = { deep: 'nested-value' };

      const proxy = createDeepProxy(() => fn);

      expect(proxy.customProp).toBe('custom-value');
      expect(proxy.nested.deep).toBe('nested-value');
    });

    it('should handle method calls with correct this binding', () => {
      const obj = {
        value: 100,
        getValue() {
          return this.value;
        },
        nested: {
          multiplier: 2,
          getMultiplied() {
            return this.multiplier * 10;
          },
        },
      };

      const proxy = createDeepProxy(() => obj);

      expect(proxy.getValue()).toBe(100);
      expect(proxy.nested.getMultiplied()).toBe(20);
    });
  });

  describe('Type coercion and edge cases', () => {
    it('should handle objects that look like functions but are not', () => {
      const notFunction = {
        call: 'not-a-function',
        apply: 'also-not-a-function',
      };
      const proxy = createDeepProxy(() => ({ obj: notFunction }));

      expect(proxy.obj.call).toBe('not-a-function');
      expect(proxy.obj.apply).toBe('also-not-a-function');
    });

    it('should handle empty objects at various nesting levels', () => {
      const nested = {
        level1: {},
        level2: { nested: {} },
        level3: { nested: { deeper: {} } },
      };

      const proxy = createDeepProxy(() => nested);

      expect(typeof proxy.level1).toBe('object');
      expect(typeof proxy.level2.nested).toBe('object');
      expect(typeof proxy.level3.nested.deeper).toBe('object');
    });

    it('should handle objects with numeric keys', () => {
      const obj = {
        0: 'zero',
        1: { nested: 'one' },
        2: { deeply: { nested: 'two' } },
      };

      const proxy = createDeepProxy(() => obj);

      expect(proxy[0]).toBe('zero');
      expect(proxy[1].nested).toBe('one');
      expect(proxy[2].deeply.nested).toBe('two');
    });

    it('should handle objects with symbol keys', () => {
      const sym1 = Symbol('test1');
      const sym2 = Symbol('test2');

      const obj: Record<symbol, any> = {
        [sym1]: 'symbol-value',
        [sym2]: { nested: 'symbol-nested' },
      };

      const proxy = createDeepProxy(() => obj);

      expect(proxy[sym1]).toBe('symbol-value');
      expect(proxy[sym2].nested).toBe('symbol-nested');
    });
  });

  describe('Proxy behavior consistency', () => {
    it('should maintain reference equality for non-object values', () => {
      const obj = { str: 'test', num: 42, bool: true };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.str).toBe(obj.str);
      expect(proxy.num).toBe(obj.num);
      expect(proxy.bool).toBe(obj.bool);
    });

    it('should cache proxy instances for same object references', () => {
      const nestedObj = { value: 'test' };
      const obj = { nested: nestedObj };
      const proxy = createDeepProxy(() => obj);

      const nested1 = proxy.nested;
      const nested2 = proxy.nested;

      expect(nested1).toBe(nested2);
      expect(nested1.value).toBe('test');
    });

    it('should handle rapid successive property access', () => {
      const obj = {
        a: { b: { c: { d: { e: 'deep-value' } } } },
      };
      const proxy = createDeepProxy(() => obj);

      for (let i = 0; i < 10; i++) {
        expect(proxy.a.b.c.d.e).toBe('deep-value');
      }
    });

    it('should handle dynamic getter changes', () => {
      let obj = { nested: { value: 'initial' } };
      const proxy = createDeepProxy(() => obj);

      const nested1 = proxy.nested;
      expect(nested1.value).toBe('initial');

      obj = { nested: { value: 'updated' } };
      const nested2 = proxy.nested;
      expect(nested2.value).toBe('updated');

      expect(nested1).not.toBe(nested2);
    });
  });

  describe('Memory and performance edge cases', () => {
    it('should handle large nested structures', () => {
      let current: any = { value: 'leaf' };
      for (let i = 0; i < 100; i++) {
        current = { [`level${i}`]: current };
      }

      const proxy = createDeepProxy(() => current);

      let target: any = proxy;
      for (let i = 99; i >= 0; i--) {
        target = target[`level${i}`];
      }
      expect(target.value).toBe('leaf');
    });

    it('should handle objects with many properties', () => {
      const obj: Record<string, any> = {};
      for (let i = 0; i < 1000; i++) {
        obj[`prop${i}`] = i % 2 === 0 ? `value${i}` : { nested: `nested${i}` };
      }

      const proxy = createDeepProxy(() => obj);

      expect(proxy.prop0).toBe('value0');
      expect(proxy.prop1.nested).toBe('nested1');
      expect(proxy.prop999.nested).toBe('nested999');
    });
  });

  describe('Read-only proxy behavior', () => {
    it('should support "has" operator (in)', () => {
      const obj = { existing: 'value', nested: { deep: 'property' } };
      const proxy = createDeepProxy(() => obj);

      expect('existing' in proxy).toBe(true);
      expect('nonExistent' in proxy).toBe(false);
      expect('deep' in proxy.nested).toBe(true);
    });

    it('should support Object.keys() via ownKeys handler', () => {
      const obj = { a: 1, b: 2, c: { nested: 'value' } };
      const proxy = createDeepProxy(() => obj);

      const keys = Object.keys(proxy);
      expect(keys).toEqual(['a', 'b', 'c']);
      expect(Object.keys(proxy.c)).toEqual(['nested']);
    });

    it('should support property descriptors', () => {
      const obj = { prop: 'value' };
      Object.defineProperty(obj, 'readonly', {
        value: 'readonly-value',
        writable: false,
        enumerable: true,
        configurable: true,
      });

      const proxy = createDeepProxy(() => obj);

      const descriptor = Object.getOwnPropertyDescriptor(proxy, 'readonly');
      expect(descriptor?.value).toBe('readonly-value');
      expect(descriptor?.writable).toBe(false);
    });

    it('should be read-only - no set handler implemented', () => {
      const obj = { value: 'initial' };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.value).toBe('initial');

      const initialValue = obj.value;

      try {
        (proxy as any).value = 'attempted-update';
        (proxy as any).newProp = 'new-value';
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }

      expect(obj.value).toBe(initialValue);
      expect((obj as any).newProp).toBeUndefined();
    });

    it('should be read-only - property deletion should fail silently', () => {
      const obj = { toDelete: 'value', toKeep: 'value' };
      const proxy = createDeepProxy(() => obj);

      delete (proxy as any).toDelete;

      expect('toDelete' in obj).toBe(true);
      expect(obj.toDelete).toBe('value');
      expect(proxy.toDelete).toBe('value');
    });

    it('should allow mutations only through direct object access', () => {
      const obj = { value: 'initial' };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.value).toBe('initial');

      obj.value = 'updated';
      expect(proxy.value).toBe('updated');

      (obj as any).newProp = 'new-value';
      expect((proxy as any).newProp).toBe('new-value');

      delete (obj as any).newProp;
      expect((proxy as any).newProp).toBeUndefined();
    });

    it('should demonstrate read-only design philosophy', () => {
      const obj = {
        level1: {
          level2: {
            value: 'initial',
            array: [1, 2, 3],
          },
        },
      };
      const proxy = createDeepProxy(() => obj);

      expect(proxy.level1.level2.value).toBe('initial');
      expect(proxy.level1.level2.array[0]).toBe(1);

      obj.level1.level2.value = 'updated';
      expect(proxy.level1.level2.value).toBe('updated');

      (obj.level1 as any).newProp = 'new-value';
      expect((proxy.level1 as any).newProp).toBe('new-value');
    });
  });

  describe('Error handling improvements', () => {
    it('should handle errors in apply handler', () => {
      const proxy = createDeepProxy(() => ({ notAFunction: 'value' }));

      expect(() => (proxy as any).notAFunction()).toThrow(TypeError);
    });

    it('should handle getter errors in various handlers', () => {
      const errorGetter = (): any => {
        throw new Error('Getter error');
      };

      const proxy = createDeepProxy(errorGetter);

      expect(() => proxy.anyProp).toThrow('Getter error');
      expect(() => 'anyProp' in proxy).toThrow('Getter error');
      expect(() => Object.keys(proxy)).toThrow('Getter error');
    });

    it('should handle fallback dummy target when getter throws', () => {
      const errorGetter = (): any => {
        throw new Error('Construction error');
      };

      expect(() => createDeepProxy(errorGetter)).not.toThrow();

      const proxy = createDeepProxy(errorGetter);
      expect(() => proxy.anyProp).toThrow('Construction error');
    });
  });

  describe('Getter function variations', () => {
    it('should handle async getter results (though proxy access is sync)', () => {
      const asyncResult = { async: 'value' };
      const proxy = createDeepProxy(() => asyncResult);

      expect(proxy.async).toBe('value');
    });

    it('should call getter for each property access (no caching)', () => {
      let callCount = 0;
      const obj = { value: 'test' };

      const proxy = createDeepProxy(() => {
        callCount++;
        return obj;
      });

      expect(proxy.value).toBe('test');
      const firstCallCount = callCount;
      expect(proxy.value).toBe('test');
      expect(callCount).toBeGreaterThan(firstCallCount);
    });

    it('should handle getter returning different objects on each call', () => {
      let counter = 0;
      const proxy = createDeepProxy(() => ({
        counter: counter++,
        nested: { value: `call-${counter}` },
      }));

      const first = proxy.counter;
      const second = proxy.counter;
      expect(second).toBeGreaterThan(first);
    });
  });

  describe('Real-world usage: Client recreation scenarios', () => {
    /**
     * Simulates the ORPC client recreation pattern where:
     * - A client object can be replaced with a new instance
     * - Nested objects (like telemetry, wallet) may be stored as references
     * - Functions must always use the latest client instance
     */

    it('should keep stored nested references fresh when client is recreated', () => {
      // Simulate initial client
      const oldClient = {
        telemetry: {
          addRouterBreadcrumb: vi.fn().mockReturnValue({ success: true }),
        },
        wallet: {
          sendTransaction: vi.fn().mockReturnValue({ hash: 'old-hash' }),
        },
      };

      let currentClient = oldClient;
      const proxy = createDeepProxy(() => currentClient);

      // Store nested reference (simulating: const telemetry = popupClient.telemetry)
      const storedTelemetry = proxy.telemetry;
      const storedWallet = proxy.wallet;

      // Verify initial state
      expect(
        storedTelemetry.addRouterBreadcrumb({ from: 'a', to: 'b' }),
      ).toEqual({
        success: true,
      });
      expect(oldClient.telemetry.addRouterBreadcrumb).toHaveBeenCalledWith({
        from: 'a',
        to: 'b',
      });

      // Simulate client recreation (port disconnect/reconnect)
      const newClient = {
        telemetry: {
          addRouterBreadcrumb: vi.fn().mockReturnValue({ success: true }),
        },
        wallet: {
          sendTransaction: vi.fn().mockReturnValue({ hash: 'new-hash' }),
        },
      };
      currentClient = newClient;

      // CRITICAL: Stored references should use the NEW client
      expect(
        storedTelemetry.addRouterBreadcrumb({ from: 'b', to: 'c' }),
      ).toEqual({
        success: true,
      });
      expect(newClient.telemetry.addRouterBreadcrumb).toHaveBeenCalledWith({
        from: 'b',
        to: 'c',
      });
      expect(oldClient.telemetry.addRouterBreadcrumb).toHaveBeenCalledTimes(1); // Only called once

      expect(storedWallet.sendTransaction({ to: '0x123' })).toEqual({
        hash: 'new-hash',
      });
      expect(newClient.wallet.sendTransaction).toHaveBeenCalledWith({
        to: '0x123',
      });
    });

    it('should ensure functions are always fresh even through cached nested proxies', () => {
      // Simulate client with nested structure
      const client1 = {
        state: {
          sessions: {
            updateActiveSession: vi.fn().mockReturnValue('client1-result'),
          },
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      // Access nested object (this creates a cached proxy)
      const sessions1 = proxy.state.sessions;
      const sessions2 = proxy.state.sessions;

      // Verify caching works (same proxy instance)
      expect(sessions1).toBe(sessions2);

      // Call function through cached proxy
      expect(sessions1.updateActiveSession({ host: 'test' })).toBe(
        'client1-result',
      );
      expect(client1.state.sessions.updateActiveSession).toHaveBeenCalledWith({
        host: 'test',
      });

      // Recreate client
      const client2 = {
        state: {
          sessions: {
            updateActiveSession: vi.fn().mockReturnValue('client2-result'),
          },
        },
      };
      currentClient = client2;

      // CRITICAL: Function accessed through cached proxy should use NEW client
      expect(sessions1.updateActiveSession({ host: 'test2' })).toBe(
        'client2-result',
      );
      expect(client2.state.sessions.updateActiveSession).toHaveBeenCalledWith({
        host: 'test2',
      });
      expect(client1.state.sessions.updateActiveSession).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle deeply nested access patterns like popupClientQueryUtils', () => {
      // Simulate TanStack Query utils pattern
      const client1 = {
        state: {
          sessions: {
            updateActiveSession: {
              mutationOptions: vi.fn().mockReturnValue({
                mutationFn: vi.fn().mockReturnValue('client1-mutation'),
              }),
            },
          },
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      // Simulate: popupClientQueryUtils.state.sessions.updateActiveSession.mutationOptions()
      const mutationOptions1 =
        proxy.state.sessions.updateActiveSession.mutationOptions();
      expect(mutationOptions1.mutationFn({ host: 'test' })).toBe(
        'client1-mutation',
      );

      // Recreate client
      const client2 = {
        state: {
          sessions: {
            updateActiveSession: {
              mutationOptions: vi.fn().mockReturnValue({
                mutationFn: vi.fn().mockReturnValue('client2-mutation'),
              }),
            },
          },
        },
      };
      currentClient = client2;

      // Access through same path should use new client
      const mutationOptions2 =
        proxy.state.sessions.updateActiveSession.mutationOptions();
      expect(mutationOptions2.mutationFn({ host: 'test' })).toBe(
        'client2-mutation',
      );
    });

    it('should handle chained method calls like popupClient.telemetry.addRouterBreadcrumb()', () => {
      const client1 = {
        telemetry: {
          addRouterBreadcrumb: vi.fn().mockResolvedValue({ success: true }),
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      // Direct chained access
      void proxy.telemetry.addRouterBreadcrumb({ from: 'a', to: 'b' });
      expect(client1.telemetry.addRouterBreadcrumb).toHaveBeenCalledWith({
        from: 'a',
        to: 'b',
      });

      // Recreate client
      const client2 = {
        telemetry: {
          addRouterBreadcrumb: vi.fn().mockResolvedValue({ success: true }),
        },
      };
      currentClient = client2;

      // Same chained access should use new client
      void proxy.telemetry.addRouterBreadcrumb({ from: 'b', to: 'c' });
      expect(client2.telemetry.addRouterBreadcrumb).toHaveBeenCalledWith({
        from: 'b',
        to: 'c',
      });
      expect(client1.telemetry.addRouterBreadcrumb).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cached proxies when object instances change', () => {
      const client1 = {
        wallet: {
          sendTransaction: vi.fn(),
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      // Access wallet (creates cached proxy)
      const wallet1 = proxy.wallet;
      const wallet2 = proxy.wallet;
      expect(wallet1).toBe(wallet2); // Same cached proxy

      // Recreate client with NEW wallet object instance
      const client2 = {
        wallet: {
          sendTransaction: vi.fn(),
        },
      };
      currentClient = client2;

      // Access wallet again - should create NEW proxy (cache miss due to new instance)
      const wallet3 = proxy.wallet;
      expect(wallet3).not.toBe(wallet1); // Different proxy instance

      // But stored reference should still work (it's a proxy that calls getter)
      wallet1.sendTransaction({ to: '0x123' });
      expect(client2.wallet.sendTransaction).toHaveBeenCalledWith({
        to: '0x123',
      });
    });

    it('should handle multiple levels of stored references', () => {
      const client1 = {
        state: {
          sessions: {
            addSession: vi.fn().mockReturnValue('client1'),
          },
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      // Store multiple levels
      const storedState = proxy.state;
      const storedSessions = storedState.sessions;

      expect(storedSessions.addSession({ host: 'test' })).toBe('client1');

      // Recreate client
      const client2 = {
        state: {
          sessions: {
            addSession: vi.fn().mockReturnValue('client2'),
          },
        },
      };
      currentClient = client2;

      // All stored references should use new client
      expect(storedSessions.addSession({ host: 'test' })).toBe('client2');
      expect(storedState.sessions.addSession({ host: 'test' })).toBe('client2');
    });

    it('should ensure function identity changes when client is recreated', () => {
      const client1 = {
        wallet: {
          sendTransaction: vi.fn(),
        },
      };

      let currentClient = client1;
      const proxy = createDeepProxy(() => currentClient);

      const fn1 = proxy.wallet.sendTransaction;
      const fn2 = proxy.wallet.sendTransaction;

      // Functions should be the same from same client
      expect(fn1).toBe(fn2);
      expect(fn1).toBe(client1.wallet.sendTransaction);

      // Recreate client
      const client2 = {
        wallet: {
          sendTransaction: vi.fn(),
        },
      };
      currentClient = client2;

      // New function should be different
      const fn3 = proxy.wallet.sendTransaction;
      expect(fn3).not.toBe(fn1);
      expect(fn3).toBe(client2.wallet.sendTransaction);
    });
  });
});
