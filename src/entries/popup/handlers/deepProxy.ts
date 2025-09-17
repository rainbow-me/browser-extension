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
      const rootValue = getter();
      const value = Reflect.get(rootValue, prop, receiver);

      // If the value is a non-null object (but not a function or special object), recursively wrap it in a proxy
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof value !== 'function' &&
        !isSpecialObject(value)
      ) {
        // Check cache first
        let cachedProxy = proxyCache.get(value);
        if (!cachedProxy) {
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
