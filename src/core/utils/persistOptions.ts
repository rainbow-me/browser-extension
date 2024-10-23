/* eslint-disable @typescript-eslint/no-explicit-any */

import { PersistOptions } from 'zustand/middleware';

type Opts<T, Migrations> = PersistOptions<T> & {
  version: number;
  migrations: Migrations;
};

type R<T> = PersistOptions<T> & {
  version: number;
  migrate: (persistedState: unknown, version: number) => T;
};

interface PersistOptionsWithMigrations {
  <Final>(opts: Opts<Final, [(s: any) => Final]>): R<Final>;
  <Final, A>(opts: Opts<Final, [(s: any) => A, (s: A) => Final]>): R<Final>;
  <Final, A, B>(
    opts: Opts<Final, [(s: any) => A, (s: A) => B, (s: B) => Final]>,
  ): R<Final>;
  <Final, A, B, C>(
    opts: Opts<
      Final,
      [(s: any) => A, (s: A) => B, (s: B) => C, (s: C) => Final]
    >,
  ): R<Final>;
  <Final, A, B, C, D>(
    opts: Opts<
      Final,
      [(s: any) => A, (s: A) => B, (s: B) => C, (s: C) => D, (s: D) => Final]
    >,
  ): R<Final>;
  <Final, A, B, C, D, E>(
    opts: Opts<
      Final,
      [
        (s: any) => A,
        (s: A) => B,
        (s: B) => C,
        (s: C) => D,
        (s: D) => E,
        (s: E) => Final,
      ]
    >,
  ): R<Final>;
  <Final, A, B, C, D, E, F>(
    opts: Opts<
      Final,
      [
        (s: any) => A,
        (s: A) => B,
        (s: B) => C,
        (s: C) => D,
        (s: D) => E,
        (s: E) => F,
        (s: F) => Final,
      ]
    >,
  ): R<Final>;
  <Final, A, B, C, D, E, F, G>(
    opts: Opts<
      Final,
      [
        (s: any) => A,
        (s: A) => B,
        (s: B) => C,
        (s: C) => D,
        (s: D) => E,
        (s: E) => F,
        (s: F) => G,
        (s: G) => Final,
      ]
    >,
  ): R<Final>;
  <Final, A, B, C, D, E, F, G, H>(
    opts: Opts<
      Final,
      [
        (s: any) => A,
        (s: A) => B,
        (s: B) => C,
        (s: C) => D,
        (s: D) => E,
        (s: E) => F,
        (s: F) => G,
        (s: G) => H,
        (s: H) => Final,
      ]
    >,
  ): R<Final>;
  <Final, A, B, C, D, E, F, G, H, I>(
    opts: Opts<
      Final,
      [
        (s: any) => A,
        (s: A) => B,
        (s: B) => C,
        (s: C) => D,
        (s: D) => E,
        (s: E) => F,
        (s: F) => G,
        (s: G) => H,
        (s: H) => I,
        (s: I) => Final,
      ]
    >,
  ): R<Final>;

  // if you need more migrations, add more overloads here
}

/**
 * Migrate a persisted state through a series of migrations, piping the result of each migration to the next.
 *
 * for example if user has persisted state from **version 1** and we are now at **version 3**, this will migrate the state from version **1** to **2** and then to **3**
 * - migrations must be in order
 * - zustand persister version must be an integer
 */
export const persistOptions: PersistOptionsWithMigrations = <TState>({
  version: storeVersion,
  migrations,
  ...persistOptions
}: PersistOptions<TState> & {
  version: number;
  migrations: ((s: unknown) => unknown)[];
}) => {
  if (migrations && migrations.length !== storeVersion) {
    throw new Error(`
      !! Review the migrations !! 
      (store name: ${persistOptions.name})
    `);
  }

  return {
    version: storeVersion,
    migrate: (persistedState: unknown, userVersion: number) =>
      migrations
        .toSpliced(0, userVersion) // remove migration before user version, as they should be already applied
        .reduce((acc, fn) => fn(acc), persistedState),
    ...persistOptions,
  };
};
