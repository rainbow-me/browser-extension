/**
 * Lazy-loading wrapper for @rainbow-me/rainbow-delegation
 *
 * TEMPORARY: This wrapper enables webpack code-splitting to reduce initial bundle size.
 * Once the delegation SDK package is properly optimized and sized, this wrapper can be
 * removed and replaced with direct imports from '@rainbow-me/rainbow-delegation'.
 *
 * MIGRATION PATH (when ready to switch back to direct imports):
 *
 * FILES TO UPDATE (search for imports from this file):
 * - src/core/raps/execute.ts
 * - src/entries/background/procedures/popup/wallet/revokeDelegation.ts
 * - src/core/resources/delegations/setup.ts
 *
 * STEPS:
 * 1. Replace all imports from this file with direct SDK imports:
 *    FROM: import { supportsDelegation } from '~/core/resources/delegations/lazyDelegation'
 *    TO:   import { supportsDelegation } from '@rainbow-me/rainbow-delegation'
 *
 * 2. Update setup.ts:
 *    - Add: import { configure as configureDelegationClient } from '@rainbow-me/rainbow-delegation'
 *    - Remove: getDelegationConfig() function and delegationConfig variable
 *    - Update setupDelegationClient() to call configureDelegationClient() directly (synchronously)
 *
 * 3. Update async calls (if any):
 *    - delegationPreference: Remove 'await' (it's sync in SDK)
 *    - All other functions remain async in SDK, so no changes needed
 *
 * 4. Delete this file (lazyDelegation.ts)
 *
 * The API signatures match the original SDK exactly, so no code changes are needed
 * beyond import path updates and removing async/await where the SDK is synchronous.
 */

// Re-export types synchronously - types don't affect bundle size
// These can stay as-is when migrating (types are always imported synchronously)
export type {
  BatchCall,
  TransactionGasOptions,
} from '@rainbow-me/rainbow-delegation';

// ============================================================================
// TEMPORARY IMPLEMENTATION DETAILS - Remove when migrating to direct imports
// ============================================================================

type DelegationSDKModule = typeof import('@rainbow-me/rainbow-delegation');

let delegationSDK: DelegationSDKModule | null = null;
let setupPromise: Promise<void> | null = null;

/**
 * Lazy-load and return delegation SDK module
 * Caches the module to avoid multiple imports
 * Webpack magic comment ensures code-splitting into a separate chunk
 *
 * TEMPORARY: Remove this function when migrating to direct imports
 */
async function importDelegationSDK(): Promise<DelegationSDKModule> {
  if (!delegationSDK) {
    // eslint-disable-next-line require-atomic-updates
    delegationSDK = await import(
      /* webpackChunkName: "delegation-sdk" */
      /* webpackMode: "lazy" */
      '@rainbow-me/rainbow-delegation'
    );
  }
  return delegationSDK;
}

/**
 * Lazy initialization - setup happens on first use
 * Dynamically imports setup config to avoid webpack tracing
 *
 * TEMPORARY: Remove this function when migrating to direct imports
 */
async function ensureDelegationSetup() {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    // Dynamically import setup config to avoid webpack including SDK
    const { getDelegationConfig } = await import('./setup');
    const config = getDelegationConfig();

    if (!config) {
      // Config not set up yet, skip initialization
      return;
    }

    const sdk = await importDelegationSDK();
    await sdk.configure(config);
  })();

  return setupPromise;
}

// ============================================================================
// PUBLIC API - These functions match the SDK API exactly
// ============================================================================

/**
 * Lazy-loaded configure function
 *
 * MIGRATION: Replace with direct import:
 *   import { configure as configureDelegationClient } from '@rainbow-me/rainbow-delegation'
 *
 * Note: In the SDK, this is synchronous: configure(config)
 *       This wrapper makes it async for lazy-loading, but the signature matches otherwise.
 */
export async function configureDelegationClient(
  config: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['configure']
  >[0],
) {
  const sdk = await importDelegationSDK();
  return sdk.configure(config);
}

/**
 * Lazy-loaded supportsDelegation function
 *
 * MIGRATION: Replace with direct import:
 *   import { supportsDelegation } from '@rainbow-me/rainbow-delegation'
 *
 * Signature matches SDK exactly - no code changes needed.
 */
export async function supportsDelegation(
  args: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['supportsDelegation']
  >[0],
) {
  await ensureDelegationSetup();
  const { supportsDelegation: fn } = await importDelegationSDK();
  return fn(args);
}

/**
 * Lazy-loaded executeBatchedTransaction function
 *
 * MIGRATION: Replace with direct import:
 *   import { executeBatchedTransaction } from '@rainbow-me/rainbow-delegation'
 *
 * Signature matches SDK exactly - no code changes needed.
 */
export async function executeBatchedTransaction(
  args: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['executeBatchedTransaction']
  >[0],
) {
  await ensureDelegationSetup();
  const { executeBatchedTransaction: fn } = await importDelegationSDK();
  return fn(args);
}

/**
 * Lazy-loaded executeRevokeDelegation function
 *
 * MIGRATION: Replace with direct import:
 *   import { executeRevokeDelegation } from '@rainbow-me/rainbow-delegation'
 *
 * Signature matches SDK exactly - no code changes needed.
 */
export async function executeRevokeDelegation(
  args: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['executeRevokeDelegation']
  >[0],
) {
  await ensureDelegationSetup();
  const { executeRevokeDelegation: fn } = await importDelegationSDK();
  return fn(args);
}

/**
 * Lazy-loaded getDelegations function
 *
 * MIGRATION: Replace with direct import:
 *   import { getDelegations } from '@rainbow-me/rainbow-delegation'
 *
 * Signature matches SDK exactly - no code changes needed.
 */
export async function getDelegations(
  args: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['getDelegations']
  >[0],
) {
  await ensureDelegationSetup();
  const { getDelegations: fn } = await importDelegationSDK();
  return fn(args);
}

/**
 * Lazy-loaded delegationPreference function
 *
 * MIGRATION: Replace with direct import:
 *   import { delegationPreference } from '@rainbow-me/rainbow-delegation'
 *
 * NOTE: In the SDK, this is synchronous: delegationPreference(args)
 *       This wrapper makes it async for lazy-loading. When migrating:
 *       - Change from async function to sync function
 *       - Remove await calls (it's sync in SDK)
 *       - Remove caching logic (not needed with direct import)
 *
 * Example migration in activation.ts:
 *   FROM: const preference = await delegationPreference({ address })
 *   TO:   const preference = delegationPreference({ address })
 */
const delegationPreferenceCache: {
  [key: string]: ReturnType<
    Awaited<ReturnType<typeof importDelegationSDK>>['delegationPreference']
  >;
} = {};

export async function delegationPreference(
  args: Parameters<
    Awaited<ReturnType<typeof importDelegationSDK>>['delegationPreference']
  >[0],
) {
  const cacheKey = JSON.stringify(args);
  if (!delegationPreferenceCache[cacheKey]) {
    await ensureDelegationSetup();
    const sdk = await importDelegationSDK();
    // eslint-disable-next-line require-atomic-updates
    delegationPreferenceCache[cacheKey] = sdk.delegationPreference(args);
  }
  return delegationPreferenceCache[cacheKey];
}
