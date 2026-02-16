import { getErrorMessage } from '~/core/utils/errors';
import { RainbowError, logger } from '~/logger';

export const LocalStorage = {
  async clear() {
    await chrome?.storage?.local?.clear();
  },
  async set<TValue = unknown>(key: string, value: TValue) {
    try {
      await chrome?.storage?.local?.set({ [key]: value });
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.includes('IO error') ||
          e.message.includes('The browser is shutting down'))
      ) {
        // dont report quota errors, this includes disk full etc
        throw e; // dont pass, as this may lead to loss of funds
      }

      const chromeError = chrome.runtime.lastError?.message;
      logger.error(new RainbowError('LocalStorage write error'), {
        message:
          e instanceof Error
            ? e.message
            : `Unknown error: ${JSON.stringify(e)}`,
        extra: { chromeError },
      });

      // pass for now, as we'll see in sentry how many errors are left. This should throw in the future
    }
  },
  async get<TValue = unknown>(key: string) {
    const result = await chrome?.storage?.local?.get(key);
    return result[key] as TValue;
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
        getErrorMessage(e).toLowerCase().indexOf('quota') !== -1
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
        message: getErrorMessage(e),
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
