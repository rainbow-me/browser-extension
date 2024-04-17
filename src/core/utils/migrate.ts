/* eslint-disable @typescript-eslint/no-explicit-any */

type R<T> = (persistedState: unknown, version: number) => T;

interface Migrator {
  <A>(m1: (s: any) => A): R<A>;
  <A, B>(m1: (s: any) => A, m2: (s: A) => B): R<B>;
  <A, B, C>(m1: (s: any) => A, m2: (s: A) => B, m3: (s: B) => C): R<C>;
  <A, B, C, D>(
    m1: (s: any) => A,
    m2: (s: A) => B,
    m3: (s: B) => C,
    m4: (s: C) => D,
  ): R<D>;
  <A, B, C, D, E>(
    m1: (s: any) => A,
    m2: (s: A) => B,
    m3: (s: B) => C,
    m4: (s: C) => D,
    m5: (s: D) => E,
  ): R<E>;
  // if you need more migrations, add more overloads here
}

/**
 * Migrate a persisted state through a series of migrations, piping the result of each migration to the next.
 *
 * for example if user has persisted state from **version 1** and we are now at **version 3**, this will migrate the state from version **1** to **2** and then to **3**
 * - migrations must be in order
 * - zustand persister version must be an integer
 */
export const migrate: Migrator = (
  ...migrations: ((s: unknown) => unknown)[]
) => {
  return (persistedState: unknown, version: number) =>
    migrations
      .toSpliced(0, version)
      .reduce((acc, fn) => fn(acc), persistedState);
};
