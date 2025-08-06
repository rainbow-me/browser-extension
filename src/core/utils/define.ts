export function defineReadOnly<T, K extends keyof T>(
  object: T,
  name: K,
  value: T[K],
): void {
  Object.defineProperty(object, name, {
    enumerable: true,
    value: value,
    writable: false,
  });
}
