# Vault Encryption Upgrade — Implementation Issues

This document catalogs the issues and oversights identified during code review of PR #2225 (`fix: upgrade browser-passworder to v6 with vault migration`), which upgrades `@metamask/browser-passworder` from v4.1.0 to v6.0.0 and increases PBKDF2 iterations from 10,000 to 600,000.

---

## 1. Redundant vault decryption in migration path

**Severity:** Performance
**Location:** `KeychainManager.ts` — `unlock()` method

The original implementation decrypts the vault **twice** during migration:

```typescript
// 1st decryption — unlock
const result = await decryptWithDetail(password, this.state.vault);

// 2nd decryption — inside updateVaultWithDetail
const upgraded = await updateVaultWithDetail(
  { vault: this.state.vault, exportedKeyString },
  password,
  RAINBOW_DERIVATION_PARAMS,
);
```

`updateVaultWithDetail()` internally calls `decrypt(password, vault)` again (see [browser-passworder line 482](https://github.com/MetaMask/browser-passworder/blob/main/src/index.ts#L482)). Each decryption derives a PBKDF2 key — at 10k iterations that's relatively fast (~50ms), but it's still a completely unnecessary operation. The decrypted vault data was already available from step 1.

**Resolution:** Removed explicit migration. `persist()` re-encrypts with `RAINBOW_DERIVATION_PARAMS` using the already-decrypted keychains in memory.

---

## 2. Explicit migration is redundant with `persist()`

**Severity:** Architectural
**Location:** `KeychainManager.ts` — `unlock()` method, lines 574–616

The entire migration block (`isVaultUpdated` check → `updateVaultWithDetail` → manual storage update → conditional `persist()` skip) duplicates what `persist()` already does:

```typescript
// persist() already does this when password is available:
const encryptionResult = await encryptWithDetail(
  privates.get(this).password as string,
  serializedKeychains,
  undefined,                  // fresh salt
  RAINBOW_DERIVATION_PARAMS,  // 600k iterations
);
```

Since `unlock()` sets `password` before calling `persist()`, the `if (pwd)` branch in `persist()` is always taken, producing a vault with 600k iterations and fresh salt. The explicit migration added ~40 lines of code, a `migrationSucceeded` flag, conditional persist skipping, and error handling — all for behavior that `persist()` provides for free.

This matches [MetaMask's approach](https://github.com/MetaMask/KeyringController/pull/312): they removed `updateVault` from the encryptor interface entirely, relying on `persistAllKeyrings()` for implicit migration.

**Resolution:** Removed explicit migration block. `unlock()` now unconditionally calls `persist()`.

---

## 3. `verifyPassword` callers missing `await` (pre-existing bug)

**Severity:** Security — Critical
**Location:** `KeychainManager.ts` — `exportAccount()` (line 497), `exportKeychain()` (line 505)

Before this PR, `verifyPassword()` was already `async` (it calls `await decrypt()`), but callers were not awaiting the result:

```typescript
// Bug: !Promise is always false — password check was bypassed
if (!this.verifyPassword(password)) {
  throw new Error('Wrong password');
}
```

A `Promise` object is truthy, so `!Promise` is always `false`, meaning the password check **never rejected**. Any password — including an empty string — would pass the export check.

The PR correctly fixed this:

```typescript
if (!(await this.verifyPassword(password))) {
  throw new Error('Wrong password');
}
```

**Impact:** Prior to this fix, `exportAccount()` and `exportKeychain()` did not validate the user's password. An attacker with access to the unlocked extension context could export private keys without knowing the password.

**Resolution:** Added `await` at both call sites. This fix is correct and was retained.

---

## 4. `verifyPassword` wrapper not marked `async`

**Severity:** Code quality
**Location:** `src/core/keychain/index.ts` — line 57

The public API wrapper returns a Promise (from the async `keychainManager.verifyPassword`) but was not marked `async`:

```typescript
// Inconsistent: returns Promise<boolean> but not declared async
export const verifyPassword = (password: string) => {
  return keychainManager.verifyPassword(password);
};
```

While functionally equivalent (it forwards the Promise), this is inconsistent with `setVaultPassword` at line 47 which explicitly `await`s the result. Marking it `async` makes the contract explicit and consistent.

**Resolution:** The `async` keyword was added, then reverted by the user (intentional). The function works correctly either way since callers `await` the returned Promise.

---

## 5. `setVaultPassword` test using wrong old password

**Severity:** Test correctness
**Location:** `src/entries/background/procedures/popup/wallet/create.test.ts` — line 33

The original test called:

```typescript
await setVaultPassword('test', 'test');
```

This passed the string `'test'` as the current password, but the vault had no password set yet (initial password is empty string `''`). The test only passed because of Issue #3 above — `verifyPassword` was not being awaited, so the password check was silently bypassed.

The PR fixed this to:

```typescript
await setVaultPassword('', 'test');
```

**Impact:** This test was passing for the wrong reason. Once the `await` fix was applied to `verifyPassword`, calling `setVaultPassword('test', 'test')` would have thrown `'Invalid password'` because the current password is `''`, not `'test'`.

**Resolution:** Corrected to pass `''` as the old password. This fix is correct and was retained.

---

## 6. `encryptWithKey` path in `persist()` does not upgrade iteration count

**Severity:** Behavioral — Low risk
**Location:** `KeychainManager.ts` — `persist()` method, `else if` branch (line 226)

The `persist()` method has two encryption paths:

| Branch | Trigger | Encryption | Upgrades? |
|--------|---------|-----------|-----------|
| `if (pwd)` | Password in memory | `encryptWithDetail(pwd, ..., RAINBOW_DERIVATION_PARAMS)` | Yes — always 600k |
| `else if (encryptionKey && salt)` | No password, cached key | `encryptWithKey(key, keychains)` | **No** — preserves original params |

The `encryptWithKey` branch reuses the existing `encryptionKey` (which carries `derivationOptions` from the original vault) and the existing `salt`. If a vault was originally encrypted with 10k iterations, and `persist()` runs via this branch (e.g., during `rehydrate()` when the service worker restarts without a password), the vault remains at 10k.

This is not a regression from this PR — the branch existed before — but it means migration only happens when the password is in memory (i.e., during `unlock()`). If the service worker restarts and `rehydrate()` triggers `persist()` without a password, the vault stays at its original iteration count until the next full unlock.

**Impact:** Low. The `rehydrate` path only fires when `encryptionKey` exists in session storage, which is set during a previous `unlock()`. By that point, `unlock()` would have already triggered migration via the `if (pwd)` branch. The only edge case is if the service worker crashes between `setEncryptionKey` (line 238) and `_setVaultInStorage` (line 241) during the first `persist()` after unlock — but this window is extremely narrow.

**Resolution:** No change needed. The `encryptWithKey` branch correctly preserves the existing key for session continuity. Full migration happens on the next `unlock()`.

---

## 7. No migration test

**Severity:** Test coverage gap
**Location:** `src/core/keychain/KeychainManager.test.ts`

There is no test that verifies the migration path: creating a vault with old-style encryption (no `keyMetadata`, 10k iterations), unlocking it, and confirming the resulting vault has `keyMetadata` with 600k iterations. This is the highest-risk code path — it affects every existing user on their first unlock after the upgrade.

The existing tests all create fresh vaults (which are immediately encrypted with 600k), so they never exercise the legacy → upgraded transition.

**Suggested test shape:**

```typescript
test('should migrate legacy vault to 600k iterations on unlock', async () => {
  // 1. Create a vault encrypted with OLD params (no keyMetadata)
  // 2. Load it into KeychainManager state
  // 3. Call unlock(password)
  // 4. Assert vault now contains keyMetadata.params.iterations === 600_000
  // 5. Assert keychains are correctly restored
});
```

**Resolution:** Not yet addressed. Recommended for follow-up.

---

## 8. Double `isVaultUpdated` check

**Severity:** Performance — Trivial
**Location:** `KeychainManager.ts` — `unlock()` method (original implementation)

The original code called `isVaultUpdated()` at line 577, then called `updateVaultWithDetail()` which [internally calls `isVaultUpdated()` again](https://github.com/MetaMask/browser-passworder/blob/main/src/index.ts#L476) as its first operation. The vault JSON was parsed and checked twice.

```typescript
// 1st check — in unlock()
if (!isVaultUpdated(this.state.vault, RAINBOW_DERIVATION_PARAMS)) {
  // 2nd check — inside updateVaultWithDetail()
  const upgraded = await updateVaultWithDetail(...);
}
```

**Resolution:** Eliminated by removing the explicit migration block entirely.

---

## Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Redundant vault decryption | Performance | Fixed |
| 2 | Explicit migration redundant with `persist()` | Architectural | Fixed |
| 3 | `verifyPassword` missing `await` (security bypass) | Critical | Fixed in PR |
| 4 | `verifyPassword` wrapper not `async` | Code quality | Deferred |
| 5 | Test using wrong old password | Test correctness | Fixed in PR |
| 6 | `encryptWithKey` path doesn't upgrade | Low risk | No change needed |
| 7 | No migration test | Test coverage | Not yet addressed |
| 8 | Double `isVaultUpdated` check | Trivial | Fixed |
| 9 | Unconditional re-encryption on every unlock | Performance | Fixed |

---

## 9. Unconditional re-encryption on every unlock

**Severity:** Performance
**Location:** `KeychainManager.ts` — `unlock()` method

The initial simplification (removing the explicit migration) replaced it with an unconditional `persist()` call at the end of `unlock()`. While correct, this re-encrypted the vault on **every** unlock — even when the vault already used 600k iterations. Each re-encryption derives a new PBKDF2 key at 600k iterations (~300-500ms), making unlock take roughly twice as long as necessary for already-migrated vaults.

```typescript
// Before: always re-encrypts (~600-1000ms total: decrypt + encrypt)
await privates.get(this).persist();
```

MetaMask's KeyringController avoids this with `#isNewEncryptionAvailable()`, which checks `isVaultUpdated()` before deciding to re-encrypt.

**Resolution:** Added conditional check using `isVaultUpdated()`. Already-migrated vaults cache the existing key/salt from the decryption result (~0ms). Legacy vaults trigger `persist()` for migration (~300-500ms one-time cost).

```typescript
if (isVaultUpdated(this.state.vault, RAINBOW_DERIVATION_PARAMS)) {
  await privates.get(this).setEncryptionKey(exportedKeyString);
  await privates.get(this).setSalt(salt);
} else {
  await privates.get(this).persist();
}
```
