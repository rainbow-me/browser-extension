# TODO

---

## Bug: Delegations menu item disappears in Settings after navigation

**Screenshots:**
- `docs/screenshots/settings-missing-delegations-item.png` — Settings page with Delegations item absent; only Wallets & Keys, Networks, and Transactions are visible

**Reported scenarios:**
1. Navigate from Settings → Delegations → press back → Delegations item is gone from Settings
2. Navigate from the Wallet screen to Settings → Delegations item sometimes does not appear

**File:** `src/entries/popup/pages/settings/settings.tsx:233`

**Root cause:** The Settings component reads `config.delegation_enabled` directly from the raw remote config proxy object (imported as `import config from '~/core/firebase/remoteConfig'`), rather than using the reactive `useRemoteConfig('delegation_enabled')` hook.

On first render, Firebase hasn't loaded yet so the default value `true` is used (defined at `remoteConfig.ts:69`). Firebase then fetches and activates remote values asynchronously. If the remote value is `false`, the proxy is updated (`notifyConfigChange` fires) — but the Settings component doesn't re-render because it's not subscribed via `useSyncExternalStore`. The next time Settings mounts (e.g. pressing back from the Delegations page, or arriving from the Wallet screen), the component reads the now-updated `false` value and omits the Delegations item.

Same issue exists for `config.approvals_enabled` at line 199.

**Fix:** Replace the direct `config.delegation_enabled` / `config.approvals_enabled` reads with the `useRemoteConfig()` hook, which already exists at `remoteConfig.ts:110` and uses `useSyncExternalStore` for reactive re-renders.

```tsx
// In Settings component:
const delegationEnabled = useRemoteConfig('delegation_enabled');
const approvalsEnabled = useRemoteConfig('approvals_enabled');

// Replace config.delegation_enabled → delegationEnabled, etc.
```

**Related files:**
- `src/entries/popup/pages/settings/settings.tsx` (lines 199, 215, 233)
- `src/core/firebase/remoteConfig.ts` (hook at line 110, defaults at line 69)

---

## Bug: Dangling "Learn more..." link on Delegations UI

**File:** `src/entries/popup/pages/home/Delegations/Delegations.tsx:99-109`

**Root cause:** The `BackupInfo` component renders a blue "Learn more..." text with no `onClick` handler or href — it looks interactive but does nothing when clicked.

```tsx
const BackupInfo = () => {
  return (
    <Stack space="8px">
      <Text size="12pt" weight="regular" color="labelTertiary" align="center">
        {i18n.t('delegations.smart_wallet.backup_info')}
      </Text>
      <Text size="12pt" weight="regular" color="blue" align="center">
        {i18n.t('delegations.smart_wallet.learn_more')}  {/* ← no action */}
      </Text>
    </Stack>
  );
};
```

`BackupInfo` is rendered in both the activated and non-activated states (lines 389, 402).

**Fix options:**
1. Remove the "Learn more..." `Text` element entirely if there's no target URL yet
2. Wire it up to a real URL via `goToNewTab({ url: ... })` if a docs page exists

i18n key: `delegations.smart_wallet.learn_more` (in `en-US.json`)

**Related files:**
- `src/entries/popup/pages/home/Delegations/Delegations.tsx` (lines 99-109, 389, 402)
- `src/core/languages/en-US.json` (key: `delegations.smart_wallet.learn_more`)

---

## Polish: Smart Wallet card border too bright — needs darker/more translucent gradient

**File:** `src/entries/popup/pages/home/Delegations/Delegations.tsx:37-44`

**Current styling in `SmartWalletCard`:**

```tsx
style={{
  background:
    'linear-gradient(180deg, rgba(27, 22, 48, 1) 0%, rgba(44, 30, 66, 1) 100%) padding-box, linear-gradient(180deg, #5F5AFA 0%, #FF7AB8 100%) border-box',
  border: '1px solid transparent',
}}
```

The border gradient uses fully opaque solid hex colors (`#5F5AFA` purple → `#FF7AB8` pink), which makes it appear too vivid against the dark card background.

**Fix:** Add alpha to the border gradient stop colors to make them more translucent. For example:

```tsx
// Before
'linear-gradient(180deg, #5F5AFA 0%, #FF7AB8 100%) border-box'

// After (example — tune alpha values to taste)
'linear-gradient(180deg, rgba(95, 90, 250, 0.4) 0%, rgba(255, 122, 184, 0.4) 100%) border-box'
```

Adjust the alpha (currently `0.4` as a starting point) until the border feels subtle but still visible. The card background is already a dark purple gradient so a ~30–50% opacity on the border should look right.

**Related files:**
- `src/entries/popup/pages/home/Delegations/Delegations.tsx` (lines 37-44, `SmartWalletCard` component)

---

## Polish: "Disable Smart Wallet" button should use muted red MenuItem style, not blue Button

**File:** `src/entries/popup/pages/home/Delegations/Delegations.tsx:380-388`

**Current:** Both "Activate" and "Disable" use the same `<Button color="blue" variant="flat">` — visually identical, even though Disable is a destructive action.

```tsx
<Button color="blue" height="44px" variant="flat" width="full" onClick={handleDisable}>
  {i18n.t('delegations.disable_smart_wallet')}
</Button>
```

**Reference pattern — "Clear Pending Transactions"** (`transactions.tsx:113-127`):
```tsx
<Menu>
  <MenuItem
    first
    last
    titleComponent={
      <MenuItem.Title color="red" text={i18n.t('settings.transactions.clear_transactions_and_nonces')} />
    }
    onClick={clearTransactions}
  />
</Menu>
```

**Reference pattern — "Add Custom Network"** (`customChain/list.tsx:155-173`):
```tsx
<MenuItem
  leftComponent={<Symbol symbol="plus.circle.fill" weight="medium" size={18} color="blue" />}
  titleComponent={<MenuItem.Title color="blue" text={...} />}
  onClick={handleAddCustomNetwork}
/>
```

**Fix:** Replace the Disable `<Button>` with a `<Menu><MenuItem>` using red text + a left SF Symbol. The "Activate" button can keep its `<Button color="blue">` style. Suggested disable symbol: `xmark.circle.fill` (or `slash.circle`).

```tsx
// Replace the disable Button with:
<Menu>
  <MenuItem
    first
    last
    leftComponent={
      <Symbol symbol="xmark.circle.fill" weight="semibold" size={18} color="red" />
    }
    titleComponent={
      <MenuItem.Title color="red" text={i18n.t('delegations.disable_smart_wallet')} />
    }
    onClick={handleDisable}
  />
</Menu>
```

Needs `Menu` and `MenuItem` imported (already available in the codebase). The `MenuContainer` wrapper is optional for a standalone action row — check how `transactions.tsx` handles padding.

**Related files:**
- `src/entries/popup/pages/home/Delegations/Delegations.tsx` (lines 376-406, action button section)
- `src/entries/popup/pages/settings/transactions.tsx` (lines 113-127, reference pattern)
- `src/entries/popup/pages/settings/customChain/list.tsx` (lines 155-173, reference pattern)

---

## Bug: Delegations page spontaneously flips Active → Inactive without user action

**Files:**
- `src/core/resources/delegations/activation.ts:18`
- `src/core/resources/delegations/delegations.ts:112`

**Root cause — two coupled issues:**

### Issue A: `remoteConfig.delegation_enabled` read without reactive hook in `useActivationStatus`

`activation.ts:18` computes:
```ts
enabled: remoteConfig.delegation_enabled && !disabled,
```

`remoteConfig.delegation_enabled` is read directly from the raw proxy object (same problem as the Settings disappearing bug). On initial mount the default `true` is returned. Firebase loads asynchronously and may update the value. The hook doesn't subscribe to this change because it doesn't use `useRemoteConfig()`.

**The trigger for the flip:** `delegations.ts:120` runs a `refetchInterval: 30000` — every 30 seconds the `useDelegations` query refetches, which triggers a re-render of the `Delegations` component. On that re-render, `useActivationStatus` recomputes `enabled` and now reads whatever `remoteConfig.delegation_enabled` has been updated to by Firebase. If Firebase returned `false`, the status silently flips to Inactive.

### Issue B: `useDelegations` `enabled` guard also reads raw `remoteConfig`

`delegations.ts:112`:
```ts
const enabled = remoteConfig.delegation_enabled && (queryEnabled ?? true) && !!address;
```

Same non-reactive read. If `remoteConfig.delegation_enabled` is `false`, this disables the query but doesn't fire a re-render to update the UI — the stale "Active" data stays displayed until the next render.

**Fix:** In `activation.ts`, replace `remoteConfig.delegation_enabled` with `useRemoteConfig('delegation_enabled')`. In `delegations.ts` the `enabled` guard is outside the hook render path so it can't use the hook directly — but it should be passed in as a parameter from the calling component that uses `useRemoteConfig`.

```ts
// activation.ts — use reactive hook
import { useRemoteConfig } from '~/core/firebase/remoteConfig';

export function useActivationStatus({ address }: { address: Address }) {
  const delegationEnabled = useRemoteConfig('delegation_enabled');
  const disabled = useDelegationDisabled(address);
  ...
  return {
    enabled: delegationEnabled && !disabled,
    ...
  };
}
```

Note: `useWillExecuteDelegation` (`hooks/useWillExecuteDelegation.ts:27`) already correctly uses `useRemoteConfig('delegation_enabled')` — `activation.ts` should match that pattern.

**Related files:**
- `src/core/resources/delegations/activation.ts` (line 18 — raw proxy read)
- `src/core/resources/delegations/delegations.ts` (line 112 — raw proxy read, line 120 — 30s refetch triggers re-render)
- `src/core/firebase/remoteConfig.ts` (line 110 — `useRemoteConfig` hook to use instead)
- `src/entries/popup/hooks/useWillExecuteDelegation.ts` (line 27 — correct pattern to follow)

---

## Bug: New Private Key import shows Smart Wallet as Disabled — should be Enabled by default

**Screenshot:** `docs/screenshots/delegation-disabled-after-pk-import.png` — Delegations page showing "Smart Wallet / Disabled" immediately after importing a fresh Private Key

**Expected:** A newly imported Private Key address should have Smart Wallet shown as **Active/Enabled** by default.

**Actual:** The Delegations page renders with the "Disabled" badge and "Activate Smart Wallet" button, as if the user had previously opted out.

**Root cause investigation — `activation.ts:18`:**

```ts
enabled: remoteConfig.delegation_enabled && !disabled,
```

`disabled` comes from `useDelegationDisabled(address)` → `!store.isDelegationEnabled(address)` → `!store.disabledAddresses.has(address)`.

The `disabledAddresses` is a `Set()` initialized as empty in the delegation store (`index.mjs:360`). A freshly imported address should never be in this Set, which would yield `disabled = false` → `enabled = true`. Two scenarios can explain the observed behavior:

**Scenario A — Firebase flag is `false` at render time:**
`remoteConfig.delegation_enabled` is read from the raw proxy (non-reactive). If Firebase resolves and returns `false` during the import flow, by the time the user navigates to Delegations the proxy holds `false`. Since the hook doesn't subscribe to the proxy, it simply reads `false` on first render and shows "Disabled". This is the same underlying bug as the Active→Inactive flip.

**Scenario B — `disabledAddresses` Set deserialization corruption:**
The delegation store is persisted to Chrome storage via `getSyncedStorage` (configured in `setup.ts:12`). JavaScript `Set` objects serialize to `{}` via `JSON.stringify`. If the `@storesjs/stores` persistence layer doesn't have a custom Set serializer, rehydration converts `disabledAddresses` from a `Set` back to a plain object `{}`. Then `{}.has(address)` is `undefined`, and calling it throws a `TypeError`. The error handler may default to `disabled = true`, causing newly imported (and all) addresses to appear disabled until the store fully reinitializes.

**Likely fix:**
Fix the `useRemoteConfig` reactivity in `activation.ts` (same fix as the Active→Inactive flip bug above). Additionally, verify that the `@rainbow-me/delegation` store correctly round-trips `disabledAddresses` through serialization — if not, migrate from `Set` to a plain object/array for storage.

**Related files:**
- `src/core/resources/delegations/activation.ts` (line 18)
- `node_modules/@rainbow-me/delegation/dist/index.mjs` (line 360 — `disabledAddresses: new Set()`)
- `src/core/resources/delegations/setup.ts` (line 12 — storage config)

---

## Feature: Move Smart Wallet (Delegations) UI to per-account context menu; show wallet name as page title

**User request:** The Delegations page is not a global setting — it is per-account. Move the entry point to the individual account level in Wallets & Keys. The Navbar title should display the wallet's name/label, not the generic "Delegations" string.

### Part 1 — Add "Edit Smart Wallet" to the per-account context menu

**File:** `src/entries/popup/pages/settings/walletsAndKeys/walletDetails.tsx:40-115`

The `InfoButtonOptions` function defines the three-dot (`MoreInfoButton`) menu for each individual account. Current items: View Private Key, Rename Wallet, Copy Address, Unhide Wallet, Delete Wallet.

Add a new item that navigates to the Delegations page for that specific account. Should only appear for non-hardware-wallet accounts (Private Key and HD wallets) since EIP-7702 requires a signing key.

```tsx
// Add to InfoButtonOptions options array (before the Delete item):
{
  onSelect: () => navigate(ROUTES.SETTINGS__DELEGATIONS),
  label: i18n.t('settings.privacy_and_security.wallets_and_keys.wallet_details.edit_smart_wallet'),
  symbol: 'bolt.shield.fill',
},
```

The Delegations page already reads `currentAddress` from the store (`Delegations.tsx:219`), so navigating to it from within the account context automatically scopes it to that account.

**File:** `src/entries/popup/pages/settings/walletsAndKeys/walletDetails.tsx`
**Also needs:** new i18n key `settings.privacy_and_security.wallets_and_keys.wallet_details.edit_smart_wallet` in `en-US.json`

### Part 2 — Change Delegations page title to show wallet name

**File:** `src/entries/popup/Routes.tsx:509`

Currently:
```tsx
title={i18n.t('delegations.title')}
```

The title should be the custom wallet name (or truncated address fallback) for the `currentAddress`. The wallet name is stored in `useWalletNamesStore` (key: `walletNames`, at `src/core/state/walletNames/index.ts`), accessed via `getWalletName({ address })`.

Options:
1. Pass a dynamic `title` to `AnimatedRoute` from a wrapper that reads the wallet name
2. Have the `Delegations` component render its own `Navbar` (removing the `navbar` prop from `AnimatedRoute`)

Option 2 is more flexible — let the `Delegations` component own its Navbar so it can display the address-specific name, similar to how `RevokeDelegationPage` renders its own `<Navbar>`.

### Part 3 — Consider removing Delegations from the global Settings menu

**File:** `src/entries/popup/pages/settings/settings.tsx:233-251`

Once the per-account entry point is added, the global Settings → Delegations item (`bolt.shield.fill`) can be removed to avoid confusion. Delegations is not a wallet-agnostic preference (unlike Currency, Language, or Theme).

**Related files:**
- `src/entries/popup/pages/settings/walletsAndKeys/walletDetails.tsx` (lines 40-115, `InfoButtonOptions`)
- `src/entries/popup/Routes.tsx` (line 509, `AnimatedRoute` title)
- `src/entries/popup/pages/home/Delegations/Delegations.tsx` (line 219, reads `currentAddress`)
- `src/core/state/walletNames/index.ts` (wallet name store)
- `src/entries/popup/pages/settings/settings.tsx` (line 233, global Delegations item to remove)
- `src/core/languages/en-US.json` (new i18n key needed)

---

## Critical Bug: `delegation_enabled = false` in Firebase causes cascading Delegations UI failures (store dump confirmed)

**Screenshots:**
- `docs/screenshots/delegation-disabled-with-base-activated.png` — "Smart Wallet: Disabled" card simultaneously showing "Activated Networks: Base"; the card status and delegation list are contradictory
- `docs/screenshots/delegation-disabled-activate-noop.png` — "Activate Smart Wallet" button does nothing when clicked

**Transaction on Base:** `0x7fc0f51d261dfeb361652e3adf8d1e3d37445fd190a784a58f0d2f140eac4c80` — Type 4 (EIP-7702) swap+delegation bundle that executed silently without any UI indication

**Observed sequence (address `0x0FCA7202706ae91F8C51A525aC3a5ca92deE2504`):**
1. Delegation menu shows "Disabled"
2. User performs a swap — no indication of delegation enrollment in the UI
3. Swap succeeds as a Type 4 (EIP-7702) transaction on Base; delegation happened silently
4. Smart Wallet menu still shows "Disabled" even after successful on-chain delegation
5. Clicking "Activate Smart Wallet" does nothing
6. Refreshing the extension shows it as "Active" (extension reads default config before Firebase loads)
7. Navigating away and returning shows "Disabled" again (Firebase has now loaded with `delegation_enabled: false`)
8. After refresh, "Activated Networks: Base" appears alongside the "Disabled" badge — contradictory state

---

### Root cause confirmed from Zustand store dump

**`disabledAddresses` is properly serialized and empty:**
```json
"disabledAddresses": { "__type": "Set", "values": [] }
```
The address is NOT locally disabled. `useDelegationDisabled(address)` = `false`. This rules out a serialization bug.

**Backend cache correctly shows on-chain delegation on Base:**
```json
"8453": {
  "currentContract": "0x612373D7003d694220f7800EeaF8E3924c0951D3",
  "currentContractName": "Rainbow Calibur",
  "delegationStatus": "DELEGATION_STATUS_RAINBOW_DELEGATED"
}
```
The backend has indexed the EIP-7702 authorization. The delegation store is correct.

**Confirmed root cause:** Firebase has `delegation_enabled: false` for this environment. Since `activation.ts:18` computes `enabled = remoteConfig.delegation_enabled && !disabled = false && true = false`, every computed state is wrong:

| What the code shows | What on-chain reality is |
|---|---|
| `isActivated = false` → "Disabled" badge | Base chain IS delegated (`DELEGATION_STATUS_RAINBOW_DELEGATED`) |
| `useDelegations` query disabled → no list rendered | Query cache HAS Base delegation (served stale until query re-enabled) |
| "Activate Smart Wallet" button visible | Nothing to activate — already delegated |
| Clicking Activate = no-op | `enableDelegation()` removes from `disabledAddresses`, but it was never there |

---

### Why "Activate" is a no-op

`handleActivate` → `enableDelegation(address)` → removes address from `disabledAddresses`. Since `disabledAddresses` was already empty, the Set doesn't change, no state update fires, and the component doesn't re-render. The button appears to work but has no effect.

---

### Additional confirmation — Polygon swap (chain 137)

**Screenshot:** `docs/screenshots/delegation-disabled-polygon-swap-confirmation.png` (temp file expired; same "Disabled + Activated Networks: Base" state as prior screenshots)

**Store dump (timestamp `1772019393972`):** Identical to prior dump. Base (8453) still `DELEGATION_STATUS_RAINBOW_DELEGATED`. Polygon (137) = `DELEGATION_STATUS_NOT_DELEGATED`. `disabledAddresses` still empty. "Activate" still does nothing.

**New data point:** The Polygon swap executed as a regular **Type 2 (EIP-1559)** transaction — no EIP-7702 bundling. This confirms that `supportsDelegation()` in the background correctly returns `supported: false` for Polygon because Polygon does not yet support EIP-7702. Delegation-in-swap is therefore chain-gated by `supportsDelegation`, not just by `atomic_swaps_enabled`. Only EIP-7702-capable chains (currently Base) receive the delegation bundle.

This also confirms the "Activate" button no-op is persistent and reproducible, not a one-time race — the address is never in `disabledAddresses`, so `enableDelegation()` always has nothing to remove.

---

### Why on-chain delegation happened silently

The popup and background service worker check **different feature flags:**

- **Popup** (`activation.ts`, `Delegations.tsx`) checks `remoteConfig.delegation_enabled` → `false` → shows "Disabled", hides UI
- **Background** (`execute.ts:230`) checks `config.atomic_swaps_enabled` → `true` (default or Firebase) → delegation proceeds via `supportsDelegation()`
- `supportsDelegation()` (`@rainbow-me/delegation`) only checks `isDelegationEnabled(address)` = `!disabledAddresses.has(address)` = `true` → delegation is supported
- Result: delegation bundled into swap, Type 4 tx submitted, **no UI indication shown** because `useWillExecuteDelegation` in popup returned `false`

---

### Timing explains the refresh behavior

| Moment | `remoteConfig.delegation_enabled` | UI shows |
|---|---|---|
| Extension opens (popup fresh mount) | `true` (hardcoded default, `remoteConfig.ts:69`) | Active |
| Firebase loads asynchronously | `false` (Firebase returns false) | Still shows Active (non-reactive read) |
| User navigates away | — | — |
| User navigates back (remounts Settings/Delegations) | `false` (proxy now holds Firebase value) | Disabled ← bug manifests here |

---

### Architectural fix required

The `delegation_enabled` remote flag is being used as both:
1. A **feature gate** (should this feature exist at all?) — correctly gates menu visibility
2. An **activation status override** (is this wallet's Smart Wallet active?) — INCORRECT: on-chain state is ground truth

These must be separated:

- **`isActivated`** should be derived from the delegation store's queryCache data (`DELEGATION_STATUS_RAINBOW_DELEGATED` on any chain), not from `remoteConfig.delegation_enabled`
- **`remoteConfig.delegation_enabled`** should only gate the Settings entry point visibility and act as a kill switch for onboarding new delegations — NOT override the display of an already-active on-chain delegation
- **`atomic_swaps_enabled` and `delegation_enabled`** must be kept in sync in Firebase, or the background execution must also check `delegation_enabled` before bundling

```ts
// activation.ts — proposed fix direction
export function useActivationStatus({ address }: { address: Address }) {
  const delegationEnabled = useRemoteConfig('delegation_enabled');
  const disabled = useDelegationDisabled(address);
  // Get actual on-chain status from the store (not just the remote flag)
  const activeDelegations = store.getActiveDelegations(address);
  const hasOnChainDelegation = activeDelegations.length > 0;

  return {
    // Active if: not locally disabled AND (has real on-chain delegation OR feature is enabled)
    enabled: !disabled && (hasOnChainDelegation || delegationEnabled),
    isLoading: false,
    enable,
    disable,
  };
}
```

**Related files:**
- `src/core/resources/delegations/activation.ts` (line 18 — the broken `enabled` computation)
- `src/core/raps/execute.ts` (lines 230-254 — background checks `atomic_swaps_enabled`, not `delegation_enabled`)
- `node_modules/@rainbow-me/delegation/dist/index.mjs` (line 360 — `disabledAddresses`, line 361 — `isDelegationEnabled`, line 681 — `supportsDelegation` only checks local disabled state)
- `src/core/resources/delegations/delegations.ts` (line 112 — `useDelegations` query also gated by `delegation_enabled`, hides stale cache data)
- `src/entries/popup/pages/home/Delegations/Delegations.tsx` (lines 222-228 — `isActivated` comes from broken hook; lines 235-238 — `handleActivate` is no-op when address not in `disabledAddresses`)
- `src/entries/popup/hooks/useWillExecuteDelegation.ts` (line 27 — popup-side delegation flag check, inconsistent with background)

---

## Bug: Pending Type 2 (EIP-1559) transaction disappears from Activity List, reappears seconds later

**Reported:** Pending transaction disappears from the Activity List before it is indexed by the backend, then reappears a few seconds later.

**Root cause: Race condition between pending tx removal and indexed tx arrival**

The Activity List combines two data sources (`ActivitiesList.tsx:74-77`):
1. `usePendingTransactionsStore` — local store of unconfirmed txs
2. `useInfiniteTransactionList` / consolidated transactions backend query — indexed/mined txs

When a transaction is mined, `useWatchPendingTransactions.ts` (the background poller, interval = 5s) detects the mined tx, then:
1. Waits 1500ms for the backend to enhance the transaction (`execute.ts`-adjacent, `useWatchPendingTransactions.ts:252`)
2. Calls `refetchQueries()` to fetch the indexed tx from the backend
3. **Immediately calls `removePendingTransactionsForAddress()`** after scheduling refetches

If the backend hasn't indexed the transaction by the time `removePendingTransactionsForAddress()` runs, the tx disappears from the pending store AND the consolidated query hasn't returned it yet. The tx vanishes from the list for several seconds until the 5s or 16s retry refetch succeeds.

**Deduplication logic in `useInfiniteTransactionList.ts:204-217`** is correct — it filters indexed txs that already appear in pending. The bug is purely the timing of removal vs. arrival.

**Why Type 2 (EIP-1559) may be more affected:** EIP-1559 transactions have more complex gas parameters that may require extra backend processing time. The 1500ms wait hardcoded in `useWatchPendingTransactions.ts:252` may be insufficient for slow backend indexing.

**Fix directions:**
1. **Don't remove from pending store until the indexed tx is confirmed in the React Query cache.** Check that `queryClient.getQueryData(consolidatedTransactionsQueryKey)` includes the tx hash before removing from the pending store.
2. **Or: keep the pending tx visible even after removal** by checking if the tx hash appears in the indexed results before the consolidated query resolves.
3. **Increase or make dynamic the 1500ms wait** based on chain indexing speed.

**Related files:**
- `src/entries/popup/pages/home/Activity/ActivitiesList.tsx` (lines 74-77 — dual data sources; lines 204-217 — deduplication)
- `src/entries/popup/hooks/useWatchPendingTransactions.ts` (lines 252, 257 — 1500ms wait and retry delays; line 270-276 — `removePendingTransactionsForAddress` call)
- `src/core/state/transactions/pendingTransactions/index.ts` (lines 63-110 — removal logic)
- `src/entries/popup/hooks/useTransactionListForPendingTxs.ts` (lines 64-140 — nonce-based confirmation watcher)

---

## Bug: Revoke Delegation UI — content not properly vertically centered

**Recording:** `docs/recordings/Feb-25-2026_smart-wallet-state-and-revoke-centering.mp4` (also demonstrates Smart Wallet state issues above)

**File:** `src/entries/popup/pages/home/Delegations/RevokeDelegationPage.tsx:425-581`

**Layout structure:**
```tsx
<Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <Navbar />                                         {/* fixed height ~56px */}

  <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Stack space="24px" alignHorizontal="center">   {/* icon + subtitle + details + progress */}
    </Stack>
  </Box>

  <Box style={{ position: 'sticky', bottom: 0 }}>  {/* fee + buttons, ~200px */}
    ...
  </Box>
</Box>
```

**The centering bug:** The middle content box uses `justifyContent: 'center'` to vertically center the icon, subtitle, and details card. However, the sticky footer (`position: sticky; bottom: 0`) sits in normal document flow after the middle box. The outer container uses `minHeight: '100vh'`, which in a Chrome extension popup equals the popup's viewport height.

When the total content (Navbar + middle content + footer) fits within the popup height, the sticky footer behaves as `position: relative` (no scrollable ancestor) and sits below the middle box. The middle box fills the remaining space via `flex: 1`, so centering works — but only if the footer's actual rendered height is correctly excluded from the flex calculation.

The likely visible symptom: content appears shifted toward the top of the visible area because the `flex: 1` middle box's available height calculation doesn't exclude the sticky footer, causing the center point to be higher than the midpoint of the visible content area (between Navbar bottom and footer top).

**Fix:** Use an explicit `Rows`/`Row` layout (already used elsewhere in the page at line 593) to divide the page into Navbar | scrollable content | fixed footer, rather than relying on `flex: 1` + `sticky`. Or simply remove `justifyContent: 'center'` and use top padding to create visual balance if the content is already taking most of the vertical space.

**Related files:**
- `src/entries/popup/pages/home/Delegations/RevokeDelegationPage.tsx` (lines 426-432 outer container, lines 440-449 middle box, lines 583-590 sticky footer)

---

## Bug: Swap transaction "From" and "To" both show user's own address for Type 4 (EIP-7702) atomic swaps

**Screenshot:** `docs/screenshots/swap-from-to-same-address-type4.png` — "Swapped" transaction detail showing both From and To as "You (0x0fca...2504)"

> Not a backend indexing limitation — this is a frontend bug in how the pending transaction is stored after atomic execution.

**File:** `src/core/raps/execute.ts:369`

**Root cause:** When an atomic swap (Type 4 / EIP-7702) is executed via `executeBatchedTransaction`, the result contains a `transaction` object where `transaction.to` is the **user's own EOA** (the delegated contract address, since in EIP-7702 the code lives at the user's address). Line 369 overwrites the pending transaction's `to` with this value:

```ts
// execute.ts:362-373 — addNewTransaction call after atomic execution
transaction: {
  ...pendingTransaction,       // ← pendingTransaction.to = quote.to (DEX router) ✓
  hash: result.hash as TxHash,
  nonce: isDelegating ? baseNonce + 1 : baseNonce,
  batch: true,
  delegation: isDelegating,
  data: transaction.data,
  to: transaction.to ?? undefined,  // ← line 369: overwrites with user's EOA ✗
  value: transaction.value ? String(transaction.value) : '0',
  gasLimit: transaction.gas?.toString(),
},
```

The prepared swap transaction (`pendingTransaction`, built by `buildSwapTransaction` in `swap.ts:280-308`) has:
- `from: quote.from` = user's EOA ✓
- `to: quote.to` = DEX router/aggregator from the swap quote ✓

But `transaction.to` from the batched result = user's EOA (EIP-7702 outer envelope `to` = the delegated account itself). This overwrites the correct DEX router address, making both `from` and `to` equal to the user's address.

**Display component** (`ActivityDetails.tsx:80-111`, `ToFrom` component) simply renders whatever `from`/`to` are on the `RainbowTransaction` — no swap-specific logic, so it faithfully displays the incorrect values.

**Fix:** For atomic swap transactions, preserve the original `to` from `pendingTransaction` rather than overwriting it with `transaction.to`. The outer envelope's `to` is an implementation detail of EIP-7702 batching, not the meaningful swap counterparty.

```ts
// execute.ts:369 — proposed fix
// Don't overwrite to for swap transactions; the batched tx.to is the
// delegated contract (user's EOA), not the swap counterparty.
// pendingTransaction.to already has the correct DEX router address.
// to: transaction.to ?? undefined,  ← remove this line
```

If `transaction.data` must be updated (it likely should for accurate calldata), that can remain — only `to` should not be overwritten for swap-type RAPs.

**Related files:**
- `src/core/raps/execute.ts` (line 369 — the overwrite; lines 355-373 — full addNewTransaction call)
- `src/core/raps/actions/swap.ts` (lines 280-308 — `buildSwapTransaction`, sets correct `to: quote.to`)
- `src/entries/popup/pages/home/Activity/ActivityDetails.tsx` (lines 80-111 — `ToFrom` display component)

---

## Bug: "Smart Account" label is duplicative in delegation transaction details; should use `To` field instead of separate row

**Screenshots:** inline in conversation (saved as `docs/screenshots/smart-account-duplicate-label.png` and `docs/screenshots/revoke-delegation-detail-view.png` — save from conversation)

**Observed:** In the "Revoked" (and "Delegate") transaction detail view, the layout shows:
```
From    →  You (0x0fca...2504)
To      →  You (0x0fca...2504)        ← both user's EOA (EIP-7702 bug from above)
Smart Account → Smart Account  ⊙      ← label and value are identical text
Hash    →  0xd767...
```

Two problems in one screen:

### Problem 1 — "Smart Account" row is duplicative (label = value)

**File:** `src/entries/popup/pages/home/Activity/ActivityDetails.tsx:113-154` (`DelegationContractRow`)

The `DelegationContractRow` component builds a `title` string from the delegation data:
```ts
const title = isRainbowDelegation
  ? i18n.t('activity_details.smart_account')   // → "Smart Account"
  : delegation?.currentContractName ?? i18n.t('activity_details.smart_account');
```

It then passes `title` as **both** the `label` prop and as `contract.name` inside the value's `AddressDisplay`:
```tsx
<InfoRow
  symbol="person.2.fill"
  label={title}                          // → "Smart Account" (left side)
  value={
    <AddressDisplay
      address={delegationContract}
      contract={{ name: title, ... }}   // → renders "Smart Account" (right side)
    />
  }
/>
```

Result: the row reads **"Smart Account → Smart Account"** — the label and the displayed name are identical.

### Problem 2 — Smart Account should replace `To`, not be a separate row

**User intent:** For `delegate` and `revoke_delegation` transactions, use "Smart Account" (the delegation contract) as the `To` address, consistent with how other parts of the app handle it. Remove the dedicated `DelegationContractRow` and instead surface the contract in the existing `To` row of `ToFrom`.

**Current layout** (`ActivityDetails.tsx:828-834`):
```tsx
<ToFrom transaction={transaction} />               {/* To = user's EOA (wrong) */}
{(transaction.type === 'delegate' ||
  transaction.type === 'revoke_delegation') && (
  <DelegationContractRow transaction={transaction} /> {/* separate "Smart Account" row */}
)}
```

**Desired layout:**
```
From  →  You (0x0fca...2504)
To    →  Smart Account  ⊙             ← delegation contract, with Rainbow icon
Hash  →  0xd767...
```

**Fix direction:** For `delegate`/`revoke_delegation` transaction types, `ToFrom` should use the delegation contract address (and "Smart Account" contract metadata) as its `to` display, rather than `transaction.to` (which is the user's EOA for EIP-7702 txs). Then remove the `DelegationContractRow` render entirely for those types.

Two implementation options:
1. **In `ToFrom`**: detect delegation tx types and substitute `to` with the contract from `DelegationContractRow`'s logic
2. **At parse time**: when `transaction.type === 'delegate' || 'revoke_delegation'`, set `transaction.to` = the delegation contract address and `transaction.contract` = `{ name: 'Smart Account', iconUrl: RainbowIcon }` so `ToFrom` renders it automatically via the existing `isToAContract` path

Option 2 is cleaner — it fixes the data at the source so the display component needs no special-casing.

**Related files:**
- `src/entries/popup/pages/home/Activity/ActivityDetails.tsx` (lines 113-154 — `DelegationContractRow` to remove; lines 80-111 — `ToFrom` to fix; lines 828-834 — render site)
- `src/core/utils/transactions.ts` (line 174-186 — `getAddressTo`, needs a `delegate`/`revoke_delegation` case to return the contract address instead of `tx.address_to`)
