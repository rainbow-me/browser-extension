import { ExtensionStorage, defineExtensionStorage } from '@webext-core/storage';
import browser from 'webextension-polyfill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;

export interface ExtensionStorageWithDefaults<
  TSchema extends AnyObject,
  TDefaults extends Partial<TSchema>,
> extends ExtensionStorage<TSchema> {
  /**
   * Returns the default value for the given key if present in the defaults object, otherwise undefined.
   */
  getDefault<TKey extends keyof TSchema>(
    key: TKey,
  ): TDefaults extends Record<TKey, TSchema[TKey]>
    ? TDefaults[TKey]
    : undefined;

  getItem<TKey extends keyof TSchema>(
    key: TKey,
  ): Promise<
    (
      TDefaults extends Record<TKey, TSchema[TKey]>
        ? TDefaults[TKey]
        : undefined
    ) extends undefined
      ? Required<TSchema>[TKey] | null
      : Required<TSchema>[TKey]
  >;
}

export function defineExtensionStorageWithDefaults<
  T extends AnyObject,
  const TDefaults extends Partial<T>,
>(
  storageArea: browser.Storage.StorageArea,
  defaults: TDefaults,
): ExtensionStorageWithDefaults<T, TDefaults> {
  const base = defineExtensionStorage<T>(storageArea);

  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop === 'getItem') {
        return async (key: keyof T) => {
          const value = await target.getItem(key);
          if (value === undefined || value === null) {
            return defaults[key];
          }
          return value;
        };
      }
      if (prop === 'getDefault') {
        return (key: keyof T) => {
          return key in defaults ? defaults[key] : undefined;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as ExtensionStorageWithDefaults<T, TDefaults>;
}
