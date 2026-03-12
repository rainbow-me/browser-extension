# Architecture Plan: Redesign `@rainbow-me/provider`

## Context

The current `@rainbow-me/provider` (v0.1.3) is a tightly coupled package that mixes inpage injection, EIP-1193 provider logic, and background request handling into one opaque unit. It was built specifically for the browser extension and cannot be reused by the mobile wallet. Key problems:

- **Not cross-platform**: Depends on browser extension primitives (chrome messaging, content scripts)
- **Reinvents viem**: Custom provider/transport instead of using viem's `EIP1193Provider`, `custom` transport, and `Client` abstractions
- **EIP sprawl**: No modular system for implementing new EIPs (5792, 7702, etc.)
- **Transaction logic duplication**: Each client (extension, mobile) must reimplement transaction flows (swaps, delegation, sends)
- **Untestable in isolation**: Integration testing requires the full browser extension environment
- **ethers.js legacy**: Still bridges viem → ethers.js for signing, adding unnecessary dependency weight

The redesign creates a monorepo that cleanly separates the **provider** (what dApps talk to) from the **wallet adapter** (what the host wallet implements), with pluggable transaction modules and EIP sub-packages.

---

## Repository: `rainbow-me/provider` (separate GitHub repo)

Standalone monorepo, consumed by both `rainbow-me/browser-extension` and `rainbow-me/mobile` as npm dependencies. Independent versioning per package via changesets.

### Monorepo Package Structure

```
rainbow-me/provider/
├── packages/
│   ├── core/                    # @rainbow-me/provider-core
│   ├── eip-2255/                # @rainbow-me/provider-eip2255
│   ├── eip-5792/                # @rainbow-me/provider-eip5792
│   ├── inpage/                  # @rainbow-me/provider-inpage
│   ├── handler/                 # @rainbow-me/provider-handler
│   └── test-utils/              # @rainbow-me/provider-test-utils
├── package.json                 # Workspace root (turborepo)
├── turbo.json
├── tsconfig.base.json
└── vitest.workspace.ts          # Shared test config
```

> **EIP-6963 (MIPD):** No dedicated package. The `mipd` library already provides
> `announceProvider()` — we call it directly from `provider-inpage`. No need to wrap it.
>
> **EIP-1193:** Not a separate package — it IS `provider-core`. The provider implements
> viem's `EIP1193Provider` interface directly.

---

## EIP Coverage

| EIP | Standard | Where it lives | Status |
|-----|----------|----------------|--------|
| **EIP-1193** | Provider API (`request`, events) | `provider-core` — the provider IS this | Already handled, re-implemented on viem types |
| **EIP-6963** | Multi Injected Provider Discovery | `provider-inpage` calls `mipd` directly | Already handled, no wrapper needed |
| **EIP-2255** | Wallet Permissions | `provider-eip2255` middleware | **New** — `wallet_requestPermissions`, `wallet_getPermissions`, `wallet_revokePermissions` |
| **EIP-5792** | Wallet Call Batching | `provider-eip5792` middleware | **New** — `wallet_sendCalls`, `wallet_getCapabilities`, `wallet_getCallsStatus` |
| **EIP-3085** | `wallet_addEthereumChain` | `provider-handler` `methodRouterMiddleware` → `WalletAdapter.addChain()` | Already handled |
| **EIP-3326** | `wallet_switchEthereumChain` | `provider-handler` `methodRouterMiddleware` → `WalletAdapter.switchChain()` | Already handled |
| **EIP-747** | `wallet_watchAsset` | `provider-handler` `methodRouterMiddleware` → `WalletAdapter` | Already handled |
| **EIP-7702** | Account delegation | External: `@rainbow-me/delegation` bound via `TransactionExecutor` | Already handled externally |

EIPs that are single RPC methods (3085, 3326, 747) don't need their own packages — they're just method routes in the handler's `methodRouterMiddleware` that dispatch to `WalletAdapter` methods. Only EIPs with substantial state, multiple methods, or complex behavior (2255, 5792) warrant dedicated middleware packages.

---

## Package Responsibilities

### 1. `@rainbow-me/provider-core`

The **platform-agnostic foundation**. Zero browser/mobile dependencies.

**Owns:**
- `RainbowEIP1193Provider` class implementing viem's `EIP1193Provider` interface
- Transport abstraction: `ProviderTransport` interface (send request, receive response)
- Event emitting (EIP-1193 events: `accountsChanged`, `chainChanged`, `connect`, `disconnect`)
- JSON-RPC request/response types
- Provider state (connected accounts, active chain)

**Key interfaces:**

```typescript
// The transport contract — implemented differently per platform
interface ProviderTransport {
  request(args: EIP1193RequestFn): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

// The provider — built on viem's EIP1193Provider type
class RainbowEIP1193Provider implements EIP1193Provider {
  constructor(transport: ProviderTransport);
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): this;
  // ...standard EIP-1193 methods
}
```

**viem integration point:** The provider IS a valid `EIP1193Provider` that can be passed directly to viem's `custom(provider)` transport or `createWalletClient({ transport: custom(provider) })`.

**Files to reference in current codebase:**
- `src/entries/inpage/index.ts` (current provider construction, lines 37-63)
- `src/core/transports/providerRequestTransport.ts` (current transport)

---

### 2. `@rainbow-me/provider-handler`

The **wallet-side request handler**. Runs in the privileged context (background script, mobile app process). This is the counterpart to the provider — it receives RPC requests and routes them through a middleware pipeline.

**Owns:**
- `RequestHandler` class with composable middleware pipeline
- Built-in middleware: rate limiting, session management, chain validation, logging
- `WalletAdapter` interface — **the clear boundary for wallet clients**
- Method routing to the correct handler (read-only RPC vs. signing vs. chain management)

**Key interfaces:**

```typescript
// THE boundary — each wallet client (extension, mobile) implements this
interface WalletAdapter {
  // Account management
  getAccounts(origin: string): Promise<Address[]>;
  requestAccounts(origin: string): Promise<Address[]>;

  // Signing — uses viem Account abstraction (see Signer Migration below)
  signMessage(params: SignMessageParams): Promise<Hex>;
  signTypedData(params: SignTypedDataParams): Promise<Hex>;
  sendTransaction(params: SendTransactionParams): Promise<Hash>;

  // Chain management
  getChainId(origin: string): Promise<number>;
  switchChain(origin: string, chainId: number): Promise<void>;
  addChain(origin: string, chain: AddEthereumChainParams): Promise<void>;

  // Session management
  getSession(origin: string): Promise<Session | null>;
  revokeSession(origin: string): Promise<void>;

  // Read-only RPC — forward to node via viem PublicClient
  rpcRequest(chainId: number, method: string, params: unknown[]): Promise<unknown>;
}

// Full JSON-RPC middleware pipeline (MetaMask json-rpc-engine pattern)
// Each middleware can handle, transform, or pass through to the next
type Middleware = (
  request: JsonRpcRequest,
  context: RequestContext,
  next: () => Promise<JsonRpcResponse>
) => Promise<JsonRpcResponse>;

class RequestHandler {
  constructor(adapter: WalletAdapter, middlewares?: Middleware[]);
  handle(request: JsonRpcRequest, context: RequestContext): Promise<JsonRpcResponse>;
  use(middleware: Middleware): void;
}
```

**Built-in middleware stack (ordered):**

```
1. loggingMiddleware        — request/response tracing
2. rateLimitMiddleware      — per-origin rate limiting (configurable)
3. sessionMiddleware        — validates active session, rejects unauthorized origins
4. eip2255Middleware        — wallet_requestPermissions / wallet_getPermissions / wallet_revokePermissions
5. [EIP middleware slots]   — eip5792Middleware, future EIPs plug in here
6. methodRouterMiddleware   — dispatches to WalletAdapter methods by RPC method name
7. rpcForwardMiddleware     — fallback: forwards unknown methods to node via adapter.rpcRequest()
```

Each middleware can short-circuit (return early), transform the request, or delegate to `next()`. This matches MetaMask's `json-rpc-engine` pattern but with async/await instead of callback-based flow.

**Files to reference in current codebase:**
- `src/entries/background/handlers/handleProviderRequest.ts` (current handler, all 407 lines)
- `src/core/state/requests/index.ts` (pending request queue)

---

### 3. `@rainbow-me/provider-eip2255`

Contained EIP-2255 (wallet permissions) implementation as handler middleware.

**Owns:**
- `wallet_requestPermissions` handler — dApps request permission scopes (e.g. `eth_accounts`)
- `wallet_getPermissions` handler — returns currently granted permissions for an origin
- `wallet_revokePermissions` handler — revoke previously granted permissions
- Permission types and caveat system (restrict permissions by chain, account, etc.)

**Exports as middleware** for `@rainbow-me/provider-handler`:

```typescript
import { eip2255Middleware } from '@rainbow-me/provider-eip2255';

const handler = new RequestHandler(adapter, [
  eip2255Middleware({ permissionStore }),
]);
```

**Why a separate package:** Permissions intersect with session management but have their own specification, caveat system, and per-origin state. MetaMask implements this as a dedicated `PermissionController` — we follow the same separation but as composable middleware rather than a controller class.

**Integrates with `WalletAdapter`:** The middleware calls `adapter.requestAccounts()` when `eth_accounts` permission is granted, keeping the adapter as the single boundary for wallet-specific logic.

---

### 4. `@rainbow-me/provider-eip5792`

Contained EIP-5792 (wallet call batching) implementation.

**Owns:**
- `wallet_getCapabilities` handler
- `wallet_sendCalls` handler (composes with `@rainbow-me/delegation` for atomic execution)
- `wallet_getCallsStatus` handler
- `wallet_showCallsStatus` handler
- Capability advertisement per chain

**Exports as middleware** for `@rainbow-me/provider-handler`:

```typescript
import { eip5792Middleware } from '@rainbow-me/provider-eip5792';

const handler = new RequestHandler(adapter, [
  eip5792Middleware({ delegation: delegationModule }),
]);
```

**Transaction module binding:** The EIP-5792 middleware accepts a `TransactionExecutor` interface that `@rainbow-me/delegation` and future `@rainbow-me/transactions` implement:

```typescript
interface TransactionExecutor {
  sendCalls(params: SendCallsParams): Promise<Hash>;
  getCallsStatus(id: string): Promise<CallsStatus>;
}
```

---

### 5. `@rainbow-me/provider-inpage`

Browser-extension-specific inpage script bundler. **Not used by mobile.**

**Owns:**
- Inpage entry point script (replaces `src/entries/inpage/index.ts`)
- `PostMessageTransport` implementing `ProviderTransport` over `window.postMessage`
- `window.ethereum` / `window.rainbow` injection
- Wallet router (`window.rnbwWalletRouter`)
- Document type guards (`shouldInjectProvider`)
- Webpack/build config for producing `inpage.js` bundle

**Assembles:**
- Creates `RainbowEIP1193Provider` from `@rainbow-me/provider-core`
- Calls `announceProvider()` from `mipd` directly (EIP-6963 — no wrapper package needed)
- Wires `PostMessageTransport` for browser extension messaging

---

### 6. `@rainbow-me/provider-test-utils`

Integration testing utilities.

**Owns:**
- `MockWalletAdapter` — in-memory wallet adapter with configurable accounts, chains, signing
- `createTestProvider()` — wires provider ↔ handler via direct function call transport (no messaging layer)
- `MockTransport` — direct in-process transport (no postMessage, no chrome messaging)
- Test fixtures for common scenarios (connect, sign, switch chain, EIP-5792 batching)

```typescript
// Full integration test without browser extension:
const { provider, handler } = createTestProvider({
  accounts: ['0xabc...'],
  chainId: 1,
});

const accounts = await provider.request({ method: 'eth_requestAccounts' });
expect(accounts).toEqual(['0xabc...']);
```

---

## Transport Architecture (Cross-Platform)

The key to cross-platform compatibility is the `ProviderTransport` abstraction. Each platform provides its own:

| Platform | Transport Implementation | Communication Channel |
|----------|------------------------|----------------------|
| Browser Extension | `PostMessageTransport` | window.postMessage → content script relay → chrome.runtime |
| Mobile (React Native) | `BridgeTransport` | React Native bridge / JSI |
| Tests | `DirectTransport` | Direct function calls (in-process) |

The provider core never knows which transport it's using.

---

## viem Integration Strategy

Instead of maintaining a parallel provider implementation, lean on viem throughout:

1. **Provider IS `EIP1193Provider`** — viem's type, not a custom one
2. **Wallet clients use viem directly** — `createWalletClient({ transport: custom(provider) })` works out of the box
3. **Read-only RPC** — `WalletAdapter.rpcRequest()` delegates to viem `PublicClient` on the handler side
4. **Signing** — handler side uses viem's `Account` abstraction and `signMessage`, `signTypedData`, `sendTransaction` from viem actions
5. **Drop ethers.js** — Remove the `clientToProvider` bridge; use viem wallet clients for signing directly

**Current files affected:**
- `src/core/viem/clientToProvider.ts` — **DELETE** (no longer needed)
- `src/core/viem/walletClient.ts` — continues to exist, used by `WalletAdapter` implementation
- `src/core/keychain/RainbowSigner.ts` — migrate from ethers Signer to viem `LocalAccount`

---

## Signer Migration (ethers.js → viem)

**Included in this redesign.** The current keychain uses ethers.js `Signer` (both `RainbowSigner` for software wallets and `HWSigner` for hardware wallets). These migrate to viem's `Account` abstraction:

### Software Wallets: `RainbowSigner` → viem `LocalAccount`

```typescript
import { privateKeyToAccount } from 'viem/accounts';

// Current: new RainbowSigner(privateKey, provider)  // ethers.js Signer
// New:     privateKeyToAccount(privateKey)            // viem LocalAccount

// The WalletAdapter implementation uses this directly:
class ExtensionWalletAdapter implements WalletAdapter {
  async signMessage({ address, message }: SignMessageParams): Promise<Hex> {
    const privateKey = await this.keychain.getPrivateKey(address);
    const account = privateKeyToAccount(privateKey);
    return account.signMessage({ message });
  }
}
```

### Hardware Wallets: `HWSigner` → viem `CustomAccount`

```typescript
import { toAccount } from 'viem/accounts';

// viem's toAccount() allows custom signing implementations
const hardwareAccount = toAccount({
  address: hwAddress,
  signMessage: async ({ message }) => {
    return await ledgerDevice.signPersonalMessage(message);
  },
  signTransaction: async (tx) => {
    return await ledgerDevice.signTransaction(tx);
  },
  signTypedData: async (typedData) => {
    return await ledgerDevice.signTypedData(typedData);
  },
});
```

### Impact on RAPs

The RAP system currently has two paths:
1. **Atomic (delegation)** — already uses viem `WalletClient`/`PublicClient`
2. **Sequential** — uses ethers.js `wallet.sendTransaction()`

After migration, both paths use viem. The sequential path switches to `walletClient.sendTransaction()`.

### Files to migrate:
- `src/core/keychain/RainbowSigner.ts` → replace with viem `privateKeyToAccount`
- `src/core/keychain/hardwareWalletSigner.ts` → replace with viem `toAccount`
- `src/core/raps/execute.ts` → use viem wallet client instead of ethers signer
- All imports of `@ethersproject/*` for signing — remove after migration

---

## Transaction Module Binding

Transaction execution is **not** part of the provider. Instead, the provider handler delegates to pluggable modules via interfaces:

```
@rainbow-me/provider-handler
    │
    ├── WalletAdapter.sendTransaction()
    │       │
    │       ▼
    │   Host wallet decides how to execute:
    │       ├── Simple send → viem walletClient.sendTransaction()
    │       ├── Swap/Bridge → @rainbow-me/transactions (future RAPs replacement)
    │       └── Batched (EIP-5792) → @rainbow-me/delegation
    │
    └── eip5792Middleware
            │
            ▼
        TransactionExecutor interface
            ├── @rainbow-me/delegation (EIP-7702 atomic batching)
            └── @rainbow-me/transactions (future, sequential fallback)
```

The host wallet's `WalletAdapter` implementation decides routing. The provider package doesn't know about swaps, bridges, or delegation internals — it just calls the adapter.

---

## Migration Path (Browser Extension)

### Phase 1: Create monorepo, implement `provider-core` and `provider-handler`
- Set up monorepo with turborepo
- Implement `RainbowEIP1193Provider` and `RequestHandler`
- Implement `WalletAdapter` interface
- Write `provider-test-utils` with `DirectTransport`
- Full integration test suite passing

### Phase 2: Implement EIP middleware packages
- `provider-eip2255` — permissions middleware (wallet_requestPermissions, wallet_getPermissions, wallet_revokePermissions)
- `provider-eip5792` — wallet call batching middleware (wallet_sendCalls, wallet_getCapabilities, wallet_getCallsStatus)

### Phase 3: Build `provider-inpage`
- `PostMessageTransport` wrapping current messenger system
- New inpage entry point assembling core + `mipd` for EIP-6963
- Bundle config producing `inpage.js`

### Phase 4: Integrate into browser extension
- Implement `WalletAdapter` in the extension's background script (replacing `handleProviderRequest.ts`)
- Wire `RequestHandler` with extension's existing state stores
- Replace `@rainbow-me/provider` v0.1.3 dependency with new packages
- Update `src/entries/inpage/index.ts` to use `@rainbow-me/provider-inpage`
- Update `src/entries/background/handlers/handleProviderRequest.ts` to use `@rainbow-me/provider-handler`

### Phase 5: Mobile adoption
- Implement `BridgeTransport` for React Native
- Implement `WalletAdapter` using mobile wallet's keychain/state
- Same provider-core, same handler, same EIP modules

---

## Testing Strategy

### Unit Tests (per package)
- `provider-core`: Provider event emission, request forwarding, state management
- `provider-handler`: Middleware pipeline, method routing, rate limiting
- `eip-2255`: Permission granting, revocation, caveat enforcement
- `eip-5792`: Capability reporting, call batching, status tracking

### Integration Tests (via `provider-test-utils`)
- Full request lifecycle: dApp → provider → handler → adapter → response
- Chain switching flows
- Account connection/disconnection
- EIP-5792 batched transactions with mock delegation executor
- Error scenarios: user rejection, rate limiting, unsupported chains
- Multi-origin session isolation

### E2E Tests (browser extension specific)
- Existing E2E suite (`yarn e2e:dappInteractions`) validates the assembled system
- No changes needed to E2E tests — they test the same `window.ethereum` API

---

## Key Files in Current Codebase to Modify

| Current File | Action |
|---|---|
| `src/entries/inpage/index.ts` | Replace with `@rainbow-me/provider-inpage` entry |
| `src/entries/background/handlers/handleProviderRequest.ts` | Replace with `WalletAdapter` impl + `RequestHandler` |
| `src/core/transports/providerRequestTransport.ts` | Replaced by `PostMessageTransport` in `provider-inpage` |
| `src/core/messengers/internal/bridge.ts` | Reused by `PostMessageTransport` internally |
| `src/core/viem/clientToProvider.ts` | Delete (ethers.js bridge no longer needed) |
| `src/core/keychain/RainbowSigner.ts` | Migrate to viem `LocalAccount` interface |
| `package.json` | Replace `@rainbow-me/provider` 0.1.3 with new packages |
