# Vault Encryption Migration: PBKDF2 10k to 600k Iterations

## Summary

PR #2225 upgrades `@metamask/browser-passworder` from v4.1.0 to v6.0.0, increasing PBKDF2-SHA256 iterations from **10,000 to 600,000** — the [OWASP minimum recommendation](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2). Legacy vaults are transparently migrated on the user's next unlock.

## Migration Strategy: Conditional Re-encryption

We use **conditional implicit migration** — the same approach MetaMask's KeyringController uses. There is no explicit `updateVault()` call. Instead, `unlock()` checks whether the vault already uses the target params via `isVaultUpdated()`. If not, `persist()` re-encrypts the vault with the current target parameters (`RAINBOW_DERIVATION_PARAMS`, 600k iterations).

### How it works

#### Already-migrated vault (600k iterations)

1. **User unlocks** → `decryptWithDetail(password, vault)` decrypts and returns `exportedKeyString` + `salt`
2. **Keychains restored** in memory from decrypted data
3. **`isVaultUpdated()` returns true** → vault already uses 600k
4. **Cache existing key/salt** in session storage for rehydration — no re-encryption needed

Cost: **1 PBKDF2 derivation** (decrypt only)

#### Legacy vault (10k iterations, no `keyMetadata`)

1. **User unlocks** → `decryptWithDetail(password, vault)` decrypts using 10k iterations (read from vault's missing `keyMetadata` → `OLD_DERIVATION_PARAMS` fallback)
2. **Keychains restored** in memory from decrypted data
3. **`isVaultUpdated()` returns false** → vault needs migration
4. **`persist()` called** → `encryptWithDetail(password, keychains, undefined, RAINBOW_DERIVATION_PARAMS)` re-encrypts with 600k iterations and a fresh cryptographic salt
5. **Upgraded vault stored** — the new vault (with `keyMetadata`) replaces the old one in local storage

Cost: **2 PBKDF2 derivations** (1 decrypt at 10k + 1 encrypt at 600k) — one-time migration cost

### Why not use `updateVaultWithDetail()` explicitly?

The library provides `updateVaultWithDetail()` for explicit migration, but using it in `unlock()` is redundant and wasteful:

- `persist()` already re-encrypts with `RAINBOW_DERIVATION_PARAMS` when a password is available
- `unlock()` always sets the password before calling `persist()`, so the password branch is always taken
- `updateVaultWithDetail()` internally decrypts the vault a **second time** (we already decrypted it in `unlock()`), adding an unnecessary 3rd PBKDF2 derivation

### MetaMask's precedent

MetaMask's KeyringController uses the same conditional pattern:

- `submitPassword()` decrypts the vault, then checks `#isNewEncryptionAvailable()` (which calls `isVaultUpdated()`)
- If the vault is outdated, it re-derives a key with new params and calls `#updateVault()` to re-encrypt
- If the vault is current, it caches the existing key — no re-encryption

Both MetaMask and Rainbow use **600,000 iterations** (MetaMask passes `encryptorFactory(600_000)` in `keyring-controller-init.ts`). The 900,000 figure is the `browser-passworder` library default, which MetaMask overrides.

Relevant references:
- [KeyringController source](https://github.com/MetaMask/core/tree/main/packages/keyring-controller) — `#isNewEncryptionAvailable()` and `persistAllKeyrings()`
- [KeyringController PR #310](https://github.com/MetaMask/KeyringController/pull/310) — Replaced `updateVault` with `isVaultUpdated`
- [KeyringController PR #312](https://github.com/MetaMask/KeyringController/pull/312) — Breaking change removing `updateVault` from encryptor interface
- [MetaMask extension encryptor factory](https://github.com/nicholasrice/metamask-extension/blob/main/app/scripts/lib/encryptor-factory.ts) — `encryptorFactory(600_000)`
- [Issue #208](https://github.com/MetaMask/KeyringController/issues/208) — Vault encryption improvement discussion

## Vault Format

### Pre-migration (v4.1.0, 10k iterations)

```json
{"data": "<base64>", "iv": "<base64>", "salt": "<base64>"}
```

### Post-migration (v6.0.0, 600k iterations)

```json
{
  "data": "<base64>",
  "iv": "<base64>",
  "salt": "<base64>",
  "keyMetadata": {
    "algorithm": "PBKDF2",
    "params": { "iterations": 600000 }
  }
}
```

The `keyMetadata` field serves two purposes:
1. Tells `decrypt()` which PBKDF2 params to use for key derivation
2. Tells `isVaultUpdated()` whether the vault matches target params

## Salt Handling

A **fresh salt** is generated during migration when `persist()` re-encrypts. The `encryptWithDetail()` function defaults its `salt` parameter to `generateSalt()` (32 bytes from `crypto.getRandomValues()`). Reusing a salt when changing iteration count would weaken PBKDF2 — each unique (salt, password, iterations) triple should produce a unique derived key.

For already-migrated vaults, the existing salt is preserved (no re-encryption occurs).

## Iteration Count Choice

| System | PBKDF2-SHA256 Iterations |
|--------|--------------------------|
| OWASP minimum | 600,000 |
| Rainbow (this PR) | 600,000 |
| MetaMask (current) | 600,000 |
| Bitwarden | 600,000 |
| 1Password | 650,000 |

We use 600,000 (OWASP minimum), matching MetaMask's production configuration.

## Exported Key Format Change

The `exportedKeyString` stored in session storage changed format between v4.1.0 and v6.0.0:

**v4.1.0** (plain JWK):
```json
{"key_ops": ["encrypt", "decrypt"], "ext": true, "kty": "oct", "k": "...", "alg": "A256GCM"}
```

**v6.0.0** (wrapped with derivation options):
```json
{
  "key": {"key_ops": ["encrypt", "decrypt"], "ext": true, "kty": "oct", "k": "...", "alg": "A256GCM"},
  "derivationOptions": {"algorithm": "PBKDF2", "params": {"iterations": 600000}}
}
```

The `importKey()` function in v6.0.0 handles both formats for backward compatibility.

## Performance

Each PBKDF2-SHA256 derivation at 600k iterations costs ~300-500ms on modern desktop hardware. The implementation minimizes derivations by only re-encrypting when the vault actually needs migration.

### Unlock cost by scenario

| Scenario | PBKDF2 derivations | Estimated time | Frequency |
|----------|--------------------|----------------|-----------|
| Already-migrated vault | 1 (decrypt) | ~300-500ms | Every unlock |
| Legacy vault migration | 2 (decrypt at 10k + encrypt at 600k) | ~305-505ms | One-time |

### Comparison with original PR implementation

The original PR used `updateVaultWithDetail()` for explicit migration and ran `persist()` unconditionally when no migration occurred. This introduced redundant PBKDF2 work:

| Scenario | Original PR | Current | Improvement |
|----------|------------|---------|-------------|
| Already-migrated (every unlock) | 2 derivations (~600-1000ms) | 1 derivation (~300-500ms) | ~50% faster |
| Legacy migration (one-time) | 3 derivations (~310-510ms) | 2 derivations (~305-505ms) | 1 fewer derivation |

**Original PR — already-migrated vault (steady state):**
1. `decryptWithDetail` — 600k derivation
2. `isVaultUpdated()` → true, skip migration
3. `persist()` runs unconditionally — 600k derivation (redundant)

**Original PR — legacy vault migration:**
1. `decryptWithDetail` — 10k derivation
2. `updateVaultWithDetail()` — internally decrypts again (10k, redundant) + encrypts (600k)
3. `persist()` skipped

**Current — already-migrated vault:**
1. `decryptWithDetail` — 600k derivation
2. `isVaultUpdated()` → true, cache existing key/salt — no re-encryption

**Current — legacy vault migration:**
1. `decryptWithDetail` — 10k derivation
2. `isVaultUpdated()` → false
3. `persist()` → `encryptWithDetail` — 600k derivation

## Risk Assessment

- **Interrupted migration**: If the process crashes during `persist()`, the old vault remains in storage — no data loss. The next unlock retries the migration.
- **Backward compatibility**: `decrypt()` reads `keyMetadata` from the vault to determine params. Missing `keyMetadata` falls back to 10k iterations (`OLD_DERIVATION_PARAMS`), so v6.0.0 can always decrypt legacy vaults.
