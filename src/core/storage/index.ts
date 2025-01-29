import { RainbowError, logger } from '~/logger';

export const LocalStorage = {
  async clear() {
    await chrome?.storage?.local?.clear();
  },
  async set(key: string, value: unknown) {
    try {
      // If value is already a string, use it directly
      // Otherwise, it should have already been stringified by React Query
      const valueToStore = value;

      // Debug log to verify what we're storing
      console.log('Storing to chrome.storage:', {
        key,
        valueType: typeof valueToStore,
        valueLength:
          typeof valueToStore === 'string' ? valueToStore.length : 'n/a',
      });

      // Store as a single key-value pair
      await chrome?.storage?.local?.set({
        [key]: valueToStore,
      });
    } catch (e) {
      console.error('Error storing data:', e);
      throw e;
    }
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
    try {
      await chrome?.storage?.session?.set({ [key]: value });
    } catch (e) {
      // This is where the quota error should show up
      const chromeError = chrome.runtime.lastError?.message;

      if (
        chromeError?.indexOf('quota') != -1 ||
        // We're still checking on both places just in case
        (e as Error)?.message.toLowerCase().indexOf('quota') !== -1
      ) {
        // If we got a quota related error, let's log the size of the keys
        // that can grow exponentially to see where we are at

        const queuedEvents = await SessionStorage.get('queuedEvents');
        const rateLimits = await SessionStorage.get('rateLimits');

        logger.info(
          'SessionStorage queuedEvents size: ',
          queuedEvents?.length || 0,
        );
        logger.info(
          'SessionStorage rateLimits size: ',
          (rateLimits && Object.keys(rateLimits).length) || 0,
        );
      }
      logger.error(new RainbowError('SessionStorage write error'), {
        message: (e as Error)?.message,
      });
    }
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
