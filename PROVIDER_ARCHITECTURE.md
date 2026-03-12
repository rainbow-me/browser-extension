# Architecture Plan: Redesign `@rainbow-me/provider`

## Context

The current `@rainbow-me/provider` (v0.1.3) is a tightly coupled package that mixes inpage injection, EIP-1193 provider logic, and background request handling into one opaque unit. It was built specifically for the browser extension and cannot be reused by the mobile wallet. Key problems:

- **Not cross-platform**: Depends on browser extension primitives (chrome messaging, content scripts)
- **Reinvents viem**: Custom provider/transport instead of using viem's `EIP1193Provider`, `custom` transport, and `Client` abstractions
- **EIP sprawl**: No modular system for implementing new EIPs (5792, 7702, etc.)
- **Transaction logic duplication**: Each client (extension, mobile) must reimplement transaction flows (swaps, delegation, sends)
- **Untestable in isolation**: Integration testing requires the full browser extension environment
- **ethers.js legacy**: Still bridges viem → ethers.js for signing, adding unnecessary dependency weight
- **Ad-hoc messenger protocol**: The current `bridgeMessenger` / `providerRequestTransport` uses untyped topic-based messaging without schema validation; the codebase has already moved to oRPC (`@orpc/contract` + `@orpc/server` + `@orpc/client`) for popup ↔ background communication — the provider channel should follow suit

The redesign creates a monorepo that cleanly separates the **provider** (what dApps talk to) from the **wallet engine** (what processes requests), with oRPC-defined contracts at every boundary, pluggable transaction modules, and EIP sub-packages.

---

## Repository: `rainbow-me/provider` (separate GitHub repo)

Standalone monorepo, consumed by both `rainbow-me/browser-extension` and `rainbow-me/mobile` as npm dependencies. Independent versioning per package via changesets.

### Monorepo Package Structure

```
rainbow-me/provider/
├── packages/
│   ├── eip1193/                 # @rainbow-me/provider-eip1193
│   ├── engine/                  # @rainbow-me/provider-engine
│   ├── eip-2255/                # @rainbow-me/provider-eip2255
│   ├── eip-5792/                # @rainbow-me/provider-eip5792
│   ├── inpage/                  # @rainbow-me/provider-inpage
│   └── contracts/               # @rainbow-me/provider-contracts
├── package.json                 # Workspace root (turborepo)
├── turbo.json
├── tsconfig.base.json
└── vitest.workspace.ts          # Shared test config
```

> **EIP-6963 (MIPD):** No dedicated package. The `mipd` library already provides
> `announceProvider()` — we call it directly from `provider-inpage`. No need to wrap it.

---

## EIP Coverage

| EIP | Standard | Where it lives | Status |
|-----|----------|----------------|--------|
| **EIP-1193** | Provider API (`request`, events) | `provider-eip1193` — the provider IS this | Already handled, re-implemented on viem types |
| **EIP-6963** | Multi Injected Provider Discovery | `provider-inpage` calls `mipd` directly | Already handled, no wrapper needed |
| **EIP-2255** | Wallet Permissions | `provider-eip2255` middleware | **New** — `wallet_requestPermissions`, `wallet_getPermissions`, `wallet_revokePermissions` |
| **EIP-5792** | Wallet Call Batching | `provider-eip5792` middleware | **New** — `wallet_sendCalls`, `wallet_getCapabilities`, `wallet_getCallsStatus` |
| **EIP-3085** | `wallet_addEthereumChain` | `provider-engine` `methodRouterMiddleware` → `WalletAdapter.addChain()` | Already handled |
| **EIP-3326** | `wallet_switchEthereumChain` | `provider-engine` `methodRouterMiddleware` → `WalletAdapter.switchChain()` | Already handled |
| **EIP-747** | `wallet_watchAsset` | `provider-engine` `methodRouterMiddleware` → `WalletAdapter` | Already handled |
| **EIP-7702** | Account delegation | External: `@rainbow-me/delegation` bound via `TransactionExecutor` | Already handled externally |

EIPs that are single RPC methods (3085, 3326, 747) don't need their own packages — they're just method routes in the engine's `methodRouterMiddleware` that dispatch to `WalletAdapter` methods. Only EIPs with substantial state, multiple methods, or complex behavior (2255, 5792) warrant dedicated middleware packages.

---

## Package Responsibilities

### 1. `@rainbow-me/provider-contracts`

**The oRPC contract definitions shared between provider and engine.** This is the single source of truth for every message that crosses the boundary. Both sides import from here.

**Owns:**
- oRPC contracts (`@orpc/contract` + zod) for every JSON-RPC method the provider can call
- Request/response schemas for all supported RPC methods
- Event schemas (accountsChanged, chainChanged, connect, disconnect)
- Shared types (Address, Hex, ChainId, Session, etc.) re-exported from viem where possible

**Key structure:**

```typescript
import { oc } from '@orpc/contract';
import z from 'zod';
import { addressSchema, hexSchema } from './schemas';

// -- JSON-RPC request envelope --
export const providerRequestContract = oc
  .input(z.object({
    method: z.string(),
    params: z.array(z.unknown()).optional(),
  }))
  .output(z.unknown());

// -- Typed per-method contracts --
export const ethRequestAccountsContract = oc
  .input(z.object({}))
  .output(z.array(addressSchema));

export const ethSendTransactionContract = oc
  .input(z.object({
    to: addressSchema.optional(),
    from: addressSchema,
    value: hexSchema.optional(),
    data: hexSchema.optional(),
    gas: hexSchema.optional(),
    gasPrice: hexSchema.optional(),
    maxFeePerGas: hexSchema.optional(),
    maxPriorityFeePerGas: hexSchema.optional(),
    nonce: hexSchema.optional(),
    chainId: hexSchema.optional(),
  }))
  .output(hexSchema); // transaction hash

export const personalSignContract = oc
  .input(z.object({
    message: hexSchema,
    address: addressSchema,
  }))
  .output(hexSchema);

export const walletSwitchEthereumChainContract = oc
  .input(z.object({
    chainId: hexSchema,
  }))
  .output(z.null());

// -- Event contracts --
export const accountsChangedEvent = z.array(addressSchema);
export const chainChangedEvent = hexSchema;

// -- Router grouping all method contracts --
export const providerRouter = {
  eth_requestAccounts: ethRequestAccountsContract,
  eth_sendTransaction: ethSendTransactionContract,
  personal_sign: personalSignContract,
  wallet_switchEthereumChain: walletSwitchEthereumChainContract,
  // ...
};
```

**Why a dedicated package:** The contract is the API boundary. The inpage side (provider) and the wallet side (engine) both depend on it, but neither depends on the other. This is the same pattern the codebase uses today — `src/entries/background/contracts/popup/` defines contracts that both the popup client and background procedures import.

---

### 2. `@rainbow-me/provider-eip1193`

The **platform-agnostic EIP-1193 provider**. What dApps talk to. Zero browser/mobile dependencies.

**Owns:**
- `RainbowEIP1193Provider` class implementing viem's `EIP1193Provider` interface
- Transport abstraction: `ProviderTransport` interface (send request, receive response)
- Event emitting (EIP-1193 events: `accountsChanged`, `chainChanged`, `connect`, `disconnect`)
- Provider state (connected accounts, active chain)

**Key interfaces:**

```typescript
import type { EIP1193Provider } from 'viem';

// The transport contract — implemented differently per platform
// This is the raw channel. oRPC link implementations sit on top.
interface ProviderTransport {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

// The provider — built on viem's EIP1193Provider type
class RainbowEIP1193Provider implements EIP1193Provider {
  constructor(transport: ProviderTransport);
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): this;
  removeListener(event: string, listener: (...args: unknown[]) => void): this;
}
```

**viem integration point:** The provider IS a valid `EIP1193Provider` that can be passed directly to viem's `custom(provider)` transport or `createWalletClient({ transport: custom(provider) })`.

**Depends on:** `@rainbow-me/provider-contracts` (for schema validation of responses)

---

### 3. `@rainbow-me/provider-engine`

The **wallet-side request processor**. Runs in the privileged context (background script, mobile app process). Receives RPC requests and routes them through a middleware pipeline. The "engine" name reflects what it does — it's the execution engine for provider requests, not a passive handler.

**Owns:**
- `ProviderEngine` class with composable middleware pipeline
- Built-in middleware: rate limiting, session management, chain validation, logging
- `WalletAdapter` interface — **the clear boundary for wallet clients**
- Method routing to the correct processor (read-only RPC vs. signing vs. chain management)
- oRPC server procedures implementing `@rainbow-me/provider-contracts`

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

class ProviderEngine {
  constructor(adapter: WalletAdapter, middlewares?: Middleware[]);
  handle(request: JsonRpcRequest, context: RequestContext): Promise<JsonRpcResponse>;
  use(middleware: Middleware): void;
}
```

**oRPC integration — implementing the contracts:**

The engine implements the provider contracts as oRPC server procedures, following the same pattern as the existing popup router:

```typescript
import { implement } from '@orpc/server';
import { providerRouter } from '@rainbow-me/provider-contracts';

// Create typed server procedures from contracts
const providerOs = implement(providerRouter).$context<ProviderContext>();

// Each method is a typed procedure
export const ethRequestAccountsProcedure = providerOs.eth_requestAccounts
  .handler(async ({ context }) => {
    // flows through middleware pipeline, then to adapter
    return engine.handle({ method: 'eth_requestAccounts' }, context);
  });
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

**Depends on:** `@rainbow-me/provider-contracts`

---

### 4. `@rainbow-me/provider-eip2255`

Contained EIP-2255 (wallet permissions) implementation as engine middleware.

**Owns:**
- `wallet_requestPermissions` procedure — dApps request permission scopes (e.g. `eth_accounts`)
- `wallet_getPermissions` procedure — returns currently granted permissions for an origin
- `wallet_revokePermissions` procedure — revoke previously granted permissions
- Permission types and caveat system (restrict permissions by chain, account, etc.)
- oRPC contracts for the three methods (added to `provider-contracts` or co-located)

**Exports as middleware** for `@rainbow-me/provider-engine`:

```typescript
import { eip2255Middleware } from '@rainbow-me/provider-eip2255';

const engine = new ProviderEngine(adapter, [
  eip2255Middleware({ permissionStore }),
]);
```

**Why a separate package:** Permissions intersect with session management but have their own specification, caveat system, and per-origin state. MetaMask implements this as a dedicated `PermissionController` — we follow the same separation but as composable middleware rather than a controller class.

**Integrates with `WalletAdapter`:** The middleware calls `adapter.requestAccounts()` when `eth_accounts` permission is granted, keeping the adapter as the single boundary for wallet-specific logic.

---

### 5. `@rainbow-me/provider-eip5792`

Contained EIP-5792 (wallet call batching) implementation.

**Owns:**
- `wallet_getCapabilities` procedure
- `wallet_sendCalls` procedure (composes with `@rainbow-me/delegation` for atomic execution)
- `wallet_getCallsStatus` procedure
- `wallet_showCallsStatus` procedure
- Capability advertisement per chain
- oRPC contracts for these methods

**Exports as middleware** for `@rainbow-me/provider-engine`:

```typescript
import { eip5792Middleware } from '@rainbow-me/provider-eip5792';

const engine = new ProviderEngine(adapter, [
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

### 6. `@rainbow-me/provider-inpage`

Browser-extension-specific inpage script bundler. **Not used by mobile.**

**Owns:**
- Inpage entry point script (replaces `src/entries/inpage/index.ts`)
- oRPC client using `@orpc/client` + custom link for `window.postMessage` transport
- `window.ethereum` / `window.rainbow` injection
- Wallet router (`window.rnbwWalletRouter`)
- Document type guards (`shouldInjectProvider`)
- Webpack/build config for producing `inpage.js` bundle

**Assembles:**
- Creates `RainbowEIP1193Provider` from `@rainbow-me/provider-eip1193`
- Calls `announceProvider()` from `mipd` directly (EIP-6963 — no wrapper package needed)
- Wires oRPC client link that sends requests through the content script bridge

---

## oRPC Messenger Architecture

The current codebase uses oRPC for popup ↔ background communication via `@orpc/server/message-port` and `@orpc/client/message-port` over `chrome.runtime.Port`. The provider channel follows the same pattern but needs to traverse: **inpage → content script → background**.

### Current provider message flow (being replaced)

```
inpage: bridgeMessenger.send('providerRequest', payload)
  → content script: windowMessenger relay → tabMessenger relay
    → background: providerRequestTransport.reply()
```

This is untyped, topic-based, with manual serialization.

### New oRPC-based flow

```
inpage: orpcClient.eth_requestAccounts()          # typed, schema-validated
  → PostMessageLink (window.postMessage)
    → content script: relay (transparent bridge)
      → chrome.runtime.sendMessage
        → background: RPCHandler(providerRouter)   # typed procedures
```

**Three layers:**

#### 1. Contracts (`@rainbow-me/provider-contracts`)

Shared zod schemas define every request/response. Both client and server import these.

#### 2. Client side (`@rainbow-me/provider-inpage`)

```typescript
import { createORPCClient } from '@orpc/client';
import { providerRouter } from '@rainbow-me/provider-contracts';

// Custom oRPC link that sends over window.postMessage
// (content script bridges to chrome.runtime)
const link = new PostMessageLink({
  targetOrigin: '*',
  channel: 'rainbow-provider',
});

const providerClient = createORPCClient(link);
```

The `RainbowEIP1193Provider` wraps this client, translating EIP-1193 `request({ method, params })` calls into typed oRPC procedure calls.

#### 3. Server side (`@rainbow-me/provider-engine`)

```typescript
import { implement } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';
import { providerRouter } from '@rainbow-me/provider-contracts';

const procedures = implement(providerRouter).$context<ProviderContext>();

// Background installs the handler
// Extension: listens on chrome.runtime.onMessage (via content script relay)
// Mobile: listens on RN bridge
const handler = new RPCHandler(procedures);
```

#### Content script relay

The content script remains a transparent bridge — it relays oRPC messages between `window.postMessage` (inpage) and `chrome.runtime` (background). It doesn't need to understand the oRPC protocol; it just forwards the raw message payloads. This is identical to the current `setupBridgeMessengerRelay()` pattern.

#### Mobile

On mobile, there's no content script. The oRPC client link connects directly to the engine — either via React Native bridge, JSI, or even direct in-process function calls. The contracts are identical; only the link implementation changes.

### oRPC link implementations per platform

| Platform | Client Link | Server Handler | Channel |
|----------|------------|----------------|---------|
| Browser Extension | `PostMessageLink` | `RPCHandler` via chrome.runtime relay | window.postMessage → content script → chrome.runtime |
| Mobile (React Native) | `BridgeLink` | `RPCHandler` via RN bridge | React Native bridge / JSI |
| Tests | `DirectLink` | Direct function call | In-process (no serialization) |

---

## viem Integration Strategy

Instead of maintaining a parallel provider implementation, lean on viem throughout:

1. **Provider IS `EIP1193Provider`** — viem's type, not a custom one
2. **Wallet clients use viem directly** — `createWalletClient({ transport: custom(provider) })` works out of the box
3. **Read-only RPC** — `WalletAdapter.rpcRequest()` delegates to viem `PublicClient` on the engine side
4. **Signing** — engine side uses viem's `Account` abstraction and `signMessage`, `signTypedData`, `sendTransaction` from viem actions
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

Transaction execution is **not** part of the provider. Instead, the provider engine delegates to pluggable modules via interfaces:

```
@rainbow-me/provider-engine
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

## Testing Strategy

No separate test-utils package. Integration test fixtures live alongside each package's tests using vitest. The `DirectLink` (in-process oRPC link) is a small utility exported from `provider-engine` for testing.

### Unit Tests (per package)
- `provider-eip1193`: Provider event emission, request forwarding, state management
- `provider-engine`: Middleware pipeline, method routing, rate limiting
- `provider-contracts`: Schema validation round-trips
- `eip-2255`: Permission granting, revocation, caveat enforcement
- `eip-5792`: Capability reporting, call batching, status tracking

### Integration Tests (in `provider-engine`)
- Full request lifecycle: provider → engine → adapter → response (via `DirectLink`)
- oRPC contract validation end-to-end — invalid requests rejected by schema
- Chain switching flows
- Account connection/disconnection
- EIP-5792 batched transactions with mock delegation executor
- Error scenarios: user rejection, rate limiting, unsupported chains
- Multi-origin session isolation

```typescript
// Integration test — no browser, no messaging, just oRPC direct link
import { createTestEngine } from '@rainbow-me/provider-engine/testing';

const { provider, engine } = createTestEngine({
  accounts: ['0xabc...'],
  chainId: 1,
});

const accounts = await provider.request({ method: 'eth_requestAccounts' });
expect(accounts).toEqual(['0xabc...']);
```

### E2E Tests (browser extension specific)
- Existing E2E suite (`yarn e2e:dappInteractions`) validates the assembled system
- No changes needed to E2E tests — they test the same `window.ethereum` API

---

## Migration Path (Browser Extension)

### Phase 1: Create monorepo, implement `provider-contracts`, `provider-eip1193`, and `provider-engine`
- Set up monorepo with turborepo
- Define oRPC contracts for all supported RPC methods
- Implement `RainbowEIP1193Provider` and `ProviderEngine`
- Define `WalletAdapter` interface
- `DirectLink` for in-process testing
- Full integration test suite passing

### Phase 2: Implement EIP middleware packages
- `provider-eip2255` — permissions middleware (wallet_requestPermissions, wallet_getPermissions, wallet_revokePermissions)
- `provider-eip5792` — wallet call batching middleware (wallet_sendCalls, wallet_getCapabilities, wallet_getCallsStatus)

### Phase 3: Build `provider-inpage`
- `PostMessageLink` (oRPC client link over window.postMessage)
- Content script relay (bridges postMessage ↔ chrome.runtime)
- New inpage entry point assembling eip1193 + `mipd` for EIP-6963
- Bundle config producing `inpage.js`

### Phase 4: Integrate into browser extension
- Implement `WalletAdapter` in the extension's background script (replacing `handleProviderRequest.ts`)
- Install oRPC `RPCHandler` with engine procedures on chrome.runtime listener
- Replace `@rainbow-me/provider` v0.1.3 dependency with new packages
- Update `src/entries/inpage/index.ts` to use `@rainbow-me/provider-inpage`
- Update `src/entries/background/handlers/handleProviderRequest.ts` to use `@rainbow-me/provider-engine`
- Remove old messenger/transport code (`bridgeMessenger`, `providerRequestTransport`)

### Phase 5: Mobile adoption
- Implement `BridgeLink` for React Native (oRPC client link over RN bridge)
- Implement `WalletAdapter` using mobile wallet's keychain/state
- Same contracts, same engine, same EIP modules

---

## Key Files in Current Codebase to Modify

| Current File | Action |
|---|---|
| `src/entries/inpage/index.ts` | Replace with `@rainbow-me/provider-inpage` entry |
| `src/entries/background/handlers/handleProviderRequest.ts` | Replace with `WalletAdapter` impl + `ProviderEngine` + oRPC RPCHandler |
| `src/core/transports/providerRequestTransport.ts` | Delete — replaced by oRPC `PostMessageLink` in `provider-inpage` |
| `src/core/messengers/internal/bridge.ts` | Simplify — content script relay now just bridges raw oRPC messages |
| `src/core/viem/clientToProvider.ts` | Delete (ethers.js bridge no longer needed) |
| `src/core/keychain/RainbowSigner.ts` | Migrate to viem `LocalAccount` interface |
| `package.json` | Replace `@rainbow-me/provider` 0.1.3 with new packages |
