/* eslint-disable @typescript-eslint/no-explicit-any */

type R<T> = (persistedState: unknown, version: number) => T;

interface Migrator {
  <T>(migrations: ((s: any) => any)[]): R<T>;
}

/**
 * Migrate a persisted state through a series of migrations, piping the result of each migration to the next.
 *
 * for example if user has persisted state from **version 1** and we are now at **version 3**, this will migrate the state from version **1** to **2** and then to **3**
 * - migrations must be in order
 * - zustand persister version must be an integer
 */
export const migrate: Migrator = (migrations: ((s: any) => any)[]) => {
  return (persistedState: any, version: number) => {
    return migrations
      .slice(0, version) // Use slice to select up to the specified version
      .reduce((acc, fn) => fn(acc), persistedState);
  };
};
