/**
 * Creates a read-only deep proxy for dynamic objects.
 *
 * This proxy is designed for read-only access to objects returned by dynamic getters.
 * It does NOT support mutations through the proxy - use direct object access for mutations.
 *
 * Features:
 * - Deep proxying of nested objects (up to any depth)
 * - Caching of proxy instances for performance
 * - Special object handling (Date, RegExp, etc. returned directly)
 * - Support for has, ownKeys, and getOwnPropertyDescriptor operations
 * - Dynamic updates when getter returns different objects
 */
export const createDeepProxy = <T extends object>(getter: () => T): T => {
  // Cache for nested proxies to prevent recreation and memory leaks
  const proxyCache = new WeakMap<object, object>();

  const handler: ProxyHandler<object> = {
    get(_target, prop, receiver) {
      // Always call getter() first to ensure we get the latest value
      // This is critical for dynamic objects that can be replaced (e.g., recreated clients)
      const rootValue = getter();
      const value = Reflect.get(rootValue, prop, receiver);

      // CRITICAL: Always return functions directly without caching
      // Functions must always reference the latest client instance, even if accessed
      // through a cached nested proxy. This ensures that when a client is recreated,
      // all method calls use the fresh client, not a stale one.
      if (typeof value === 'function') {
        return value;
      }

      // For nested objects, create a proxy that will always get fresh values
      // The nested proxy's getter calls the root getter, ensuring freshness
      if (
        typeof value === 'object' &&
        value !== null &&
        !isSpecialObject(value)
      ) {
        // Cache proxies by object instance to prevent recreation
        // When the object instance changes (e.g., new client), cache miss occurs
        // and a new proxy is created, ensuring we always use fresh objects
        let cachedProxy = proxyCache.get(value);
        if (!cachedProxy) {
          // Create nested proxy with getter that calls root getter for freshness
          // This ensures that even cached nested proxies always access fresh data
          cachedProxy = createDeepProxy(() => {
            const freshRoot = getter();
            return Reflect.get(freshRoot, prop, receiver) as object;
          });
          proxyCache.set(value, cachedProxy);
        }
        return cachedProxy;
      }
      return value;
    },

    apply(_target, thisArg, argumentsList) {
      const fn = getter();
      return Reflect.apply(
        fn as unknown as (...args: unknown[]) => unknown,
        thisArg,
        argumentsList,
      );
    },

    has(_target, prop) {
      const rootValue = getter();
      return Reflect.has(rootValue, prop);
    },

    ownKeys() {
      const rootValue = getter();
      return Reflect.ownKeys(rootValue);
    },

    getOwnPropertyDescriptor(_target, prop) {
      const rootValue = getter();
      return Reflect.getOwnPropertyDescriptor(rootValue, prop);
    },

    // Note: set and deleteProperty handlers are intentionally omitted
    // This proxy is designed for read-only access to dynamic objects
    // Mutations should be performed directly on the underlying objects
  };

  // Determine the appropriate dummy target
  let dummy: object;
  try {
    const rootValue = getter();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dummy = typeof rootValue === 'function' ? function () {} : {};
  } catch {
    // If getter throws, use empty object as fallback
    dummy = {};
  }

  return new Proxy(dummy, handler) as T;
};

// Helper function to identify special objects that shouldn't be proxied deeply
function isSpecialObject(value: object): boolean {
  return (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Error ||
    value instanceof Promise ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    ArrayBuffer.isView(value) || // Typed arrays, DataView
    value instanceof ArrayBuffer ||
    (typeof Node !== 'undefined' && value instanceof Node) || // DOM nodes
    (typeof Element !== 'undefined' && value instanceof Element) // DOM elements
  );
}
