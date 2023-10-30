export const LocalStorage = {
  async clear() {
    await chrome?.storage?.local?.clear();
  },
  async set(key: string, value: unknown) {
    await chrome?.storage?.local?.set({ [key]: value });
  },
  async get(key: string) {
    const result = await chrome?.storage?.local?.get(key);
    return result[key];
  },
  async remove(key: string) {
    await chrome?.storage?.local?.remove(key);
  },
  async listen<TValue = unknown>(
    key: string,
    callback: (newValue: TValue, oldValue: TValue) => void,
  ) {
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (!changes[key] || changes[key]?.newValue === changes[key]?.oldValue)
        return;
      const newValue = changes[key]?.newValue;
      const oldValue = changes[key]?.oldValue;
      callback(newValue, oldValue);
    };
    chrome.storage?.local?.onChanged?.addListener(listener);
    return () => chrome.storage?.local?.onChanged?.removeListener(listener);
  },
};

export const SessionStorage = {
  async clear() {
    await chrome?.storage?.session?.clear();
  },
  async set(key: string, value: unknown) {
    await chrome?.storage?.session?.set({ [key]: value });
  },
  async get(key: string) {
    const result = await chrome?.storage?.session?.get(key);
    return result[key];
  },
  async remove(key: string) {
    await chrome?.storage?.session?.remove(key);
  },
  async listen<TValue = unknown>(
    key: string,
    callback: (newValue: TValue, oldValue: TValue) => void,
  ) {
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (!changes[key] || changes[key]?.newValue === changes[key]?.oldValue)
        return;
      const newValue = changes[key]?.newValue;
      const oldValue = changes[key]?.oldValue;
      callback(newValue, oldValue);
    };
    chrome.storage?.session?.onChanged?.addListener(listener);
    return () => chrome.storage?.session?.onChanged?.removeListener(listener);
  },
};
