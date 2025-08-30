import { vi } from 'vitest';

export function createMockStorages() {
  const local = new Map<string, unknown>();
  const session = new Map<string, unknown>();

  const createApi = (map: Map<string, unknown>) => ({
    clear: vi.fn(async () => {
      map.clear();
    }),
    set: vi.fn(async <TValue = unknown>(key: string, value: TValue) => {
      map.set(key, value);
    }),
    get: vi.fn(async <TValue = unknown>(key: string) => {
      return map.get(key) as TValue | undefined;
    }),
    remove: vi.fn(async (key: string) => {
      map.delete(key);
    }),
    listen: vi.fn(() => {
      // No-op for mock
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }),
  });

  return {
    LocalStorage: createApi(local),
    SessionStorage: createApi(session),
  };
}
