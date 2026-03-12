# Architecture Plan: Redesign `@rainbow-me/provider`

## Context

The current `@rainbow-me/provider` (v0.1.3) is a tightly coupled package that mixes inpage injection, EIP-1193 provider logic, and background request handling into one opaque unit. Key problems:

- **Not cross-platform**: Depends on browser extension primitives (chrome messaging, content scripts)
- **Reinvents viem**: Custom provider/transport instead of using viem's `EIP1193Provider`, `custom` transport, and `Client` abstractions
- **EIP sprawl**: No modular system for implementing new EIPs (5792, 7702, etc.)
- **No WalletConnect integration**: Mobile uses WalletConnect for remote dApp connections, but shares zero RPC-handling code with the dApp browser provider
- **Execution coupled to transport**: Transaction signing, message signing, and chain switching are tangled with the messaging layer — no way to share business logic between dApp browser and WalletConnect callers
- **No UI driver abstraction**: Operations that need user approval (send transaction, sign message, connect) have their approval flows baked into platform-specific code rather than a portable interface
- **ethers.js legacy**: Still bridges viem → ethers.js for signing

The redesign creates a monorepo where **two callers** (dApp browser provider, WalletConnect) share **one execution engine** with **one set of business logic and UI drivers**, differing only in transport and protocol quirks.

---

## Repository: `rainbow-me/provider` (separate GitHub repo)

Standalone monorepo, consumed by `rainbow-me/browser-extension`, `rainbow-me/rainbow` (mobile), and any future wallet client. Independent versioning per package via changesets.

### Monorepo Package Structure

```
rainbow-me/provider/
├── packages/
│   ├── provider/                  # @rainbow-me/provider           — the entrypoint: engine + middleware + WalletAdapter
│   ├── eip1193/                   # @rainbow-me/provider-eip1193   — EIP-1193 provider (dApp-facing)
│   ├── eip2255/                   # @rainbow-me/provider-eip2255   — wallet permissions middleware
│   ├── eip5792/                   # @rainbow-me/provider-eip5792   — wallet call batching middleware
│   ├── walletconnect/             # @rainbow-me/provider-walletconnect — WC v2 → provider adapter
│   └── inpage/                    # @rainbow-me/provider-inpage    — browser extension injection
├── package.json                   # Workspace root (turborepo)
├── turbo.json
├── tsconfig.base.json
└── vitest.workspace.ts
```

No separate `contracts` package. Each package owns its own oRPC contracts co-located with the implementation. The `@rainbow-me/provider` package re-exports the shared schemas that callers need.

> **EIP-6963 (MIPD):** No dedicated package. `mipd` provides `announceProvider()` — called directly from `provider-inpage`.

---

## The Two Callers, One Engine Model

```
┌─────────────────┐     ┌──────────────────────┐
│   Dapp Browser   │     │     WalletConnect     │
│  (EIP-1193 via   │     │   (session_request    │
│   inpage script)  │     │    events from WC v2) │
└────────┬─────────┘     └──────────┬────────────┘
         │                          │
         │  oRPC / postMessage      │  @walletconnect/web3wallet
         │                          │
         ▼                          ▼
┌─────────────────┐     ┌──────────────────────┐
│ provider-inpage  │     │ provider-walletconnect│
│ (PostMessageLink)│     │ (WC → RPC adapter)   │
└────────┬─────────┘     └──────────┬────────────┘
         │                          │
         │  { method, params }      │  { method, params }
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  @rainbow-me/provider │
         │  (ProviderEngine)     │
         │                       │
         │  middleware pipeline:  │
         │  rate-limit → session  │
         │  → eip2255 → eip5792  │
         │  → method router      │
         │  → rpc forward        │
         └──────────┬────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │    WalletAdapter     │
         │  (platform-specific) │
         │                       │
         │  ┌─────────────────┐ │
         │  │  RequestGate    │ │  ← pauses execution, waits for UI approval
         │  └────────┬────────┘ │
         │           ▼          │
         │  ┌─────────────────┐ │
         │  │  UI Drivers     │ │  ← portable approval logic (sign, send, connect)
         │  └────────┬────────┘ │
         │           ▼          │
         │  ┌─────────────────┐ │
         │  │  Keychain/viem  │ │  ← actual signing & submission
         │  └─────────────────┘ │
         └─────────────────────┘
```

Both callers produce the same `{ method, params }` shape. Both flow through the same engine. Both hit the same `WalletAdapter`. The only differences are:

| Concern | Dapp Browser | WalletConnect |
|---------|-------------|---------------|
| **Transport** | oRPC over postMessage (inpage → content script → background) | WC v2 SDK session_request events |
| **Session model** | Per-origin `AppSession` managed by extension/app | WC pairing + session managed by `@walletconnect/web3wallet` |
| **Chain scope** | Single active chain per origin | Multiple chains per session (WC namespaces) |
| **Auto-connect** | `eth_requestAccounts` triggers approval | WC `session_proposal` triggers approval |
| **Quirks** | EIP-6963 announcement, `window.ethereum` compat | WC response format, topic-based routing |

These quirks live in their respective adapter packages (`provider-inpage`, `provider-walletconnect`), **not** in the engine.

---

## Package Responsibilities

### 1. `@rainbow-me/provider` (the entrypoint)

The **shared execution engine**. This is where all RPC processing happens. Both dApp browser and WalletConnect callers ultimately call into this.

**Owns:**
- `ProviderEngine` class with composable middleware pipeline
- `WalletAdapter` interface — **the boundary for platform-specific wallet code**
- `RequestGate` — the mechanism for pausing execution to wait for UI approval
- UI driver interfaces — portable descriptions of what the UI needs to show
- oRPC contracts for all core RPC methods (co-located, not a separate package)
- Built-in middleware: rate limiting, session management, chain validation, logging, method routing
- `DirectLink` export for testing

**oRPC contracts (co-located):**

Each RPC method has a zod schema and oRPC contract defined right next to its implementation:

```typescript
// packages/provider/src/methods/eth_sendTransaction.ts
import { oc } from '@orpc/contract';
import z from 'zod';

export const ethSendTransactionContract = oc
  .input(z.object({
    to: addressSchema.optional(),
    from: addressSchema,
    value: hexSchema.optional(),
    data: hexSchema.optional(),
    // ...
  }))
  .output(hexSchema);

// The procedure implementation sits right here too
export const ethSendTransaction = implement(ethSendTransactionContract)
  .handler(async ({ input, context }) => {
    // → middleware pipeline → adapter.sendTransaction()
  });
```

The package re-exports all contracts from a single entrypoint for callers that need them:

```typescript
// packages/provider/src/contracts.ts
export { ethSendTransactionContract } from './methods/eth_sendTransaction';
export { personalSignContract } from './methods/personal_sign';
// ...
```

**Key interfaces:**

```typescript
// ---- The platform boundary ----
interface WalletAdapter {
  // Account management
  getAccounts(origin: string): Promise<Address[]>;
  requestAccounts(origin: string): Promise<Address[]>;

  // Signing
  signMessage(params: SignMessageParams): Promise<Hex>;
  signTypedData(params: SignTypedDataParams): Promise<Hex>;
  sendTransaction(params: SendTransactionParams): Promise<Hash>;

  // Chain management
  getChainId(origin: string): Promise<number>;
  switchChain(origin: string, chainId: number): Promise<void>;
  addChain(origin: string, chain: AddEthereumChainParams): Promise<void>;

  // Session
  getSession(origin: string): Promise<Session | null>;
  revokeSession(origin: string): Promise<void>;

  // Read-only RPC fallback
  rpcRequest(chainId: number, method: string, params: unknown[]): Promise<unknown>;
}

// ---- Request gate: decouple RPC from UI approval ----
interface RequestGate {
  /**
   * Suspends execution until the UI approves or rejects.
   * Returns the approval payload, or throws UserRejectedRequestError.
   */
  requestApproval<T>(request: ApprovalRequest): Promise<T>;
}

// ---- Approval request descriptors ----
type ApprovalRequest =
  | { type: 'connect'; origin: string; metadata: DappMetadata }
  | { type: 'sign_message'; origin: string; message: string | Hex; method: SignMethod }
  | { type: 'sign_typed_data'; origin: string; typedData: TypedData }
  | { type: 'send_transaction'; origin: string; transaction: TransactionRequest }
  | { type: 'switch_chain'; origin: string; chainId: number }
  | { type: 'add_chain'; origin: string; chain: AddEthereumChainParams };

// ---- UI driver interface ----
// The host app provides this to drive its native UI
interface ApprovalUI {
  show(request: ApprovalRequest): Promise<ApprovalResult>;
  dismiss(requestId: string): void;
}

type ApprovalResult =
  | { status: 'approved'; payload: unknown }
  | { status: 'rejected' };
```

**RequestGate explained:**

This is the key decoupling mechanism. When the engine processes `eth_sendTransaction`, it doesn't pop up a browser window or navigate a React Native screen. Instead:

1. Engine calls `requestGate.requestApproval({ type: 'send_transaction', ... })`
2. The gate **suspends** (returns a Promise that doesn't resolve yet)
3. The platform's `ApprovalUI` implementation shows the appropriate screen
4. User approves → gate resolves with the payload
5. User rejects → gate throws `UserRejectedRequestError`
6. Engine continues with the result

This is exactly what the extension does today with `addPendingRequest()` → `waitForPendingRequest()`, but as a portable interface instead of extension-specific code.

**Built-in middleware stack:**

```
1. loggingMiddleware        — request/response tracing
2. rateLimitMiddleware      — per-origin rate limiting
3. sessionMiddleware        — validates active session
4. eip2255Middleware        — wallet_requestPermissions / wallet_getPermissions
5. [EIP middleware slots]   — eip5792, future EIPs
6. methodRouterMiddleware   — dispatches to WalletAdapter by method name
7. rpcForwardMiddleware     — fallback: unknown methods → adapter.rpcRequest()
```

---

### 2. `@rainbow-me/provider-eip1193`

The **dApp-facing EIP-1193 provider**. Platform-agnostic. Zero browser/mobile dependencies.

**Owns:**
- `RainbowEIP1193Provider` class implementing viem's `EIP1193Provider`
- `ProviderTransport` interface (request/response + events)
- EIP-1193 event emitting (`accountsChanged`, `chainChanged`, `connect`, `disconnect`)
- Provider state (connected accounts, active chain)

```typescript
class RainbowEIP1193Provider implements EIP1193Provider {
  constructor(transport: ProviderTransport);
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): this;
  removeListener(event: string, listener: (...args: unknown[]) => void): this;
}
```

The provider IS a valid viem `EIP1193Provider` → `custom(provider)` works out of the box.

---

### 3. `@rainbow-me/provider-walletconnect`

**Maps WalletConnect v2 session requests to provider engine calls.** This is the adapter between `@walletconnect/web3wallet` and `@rainbow-me/provider`.

**Owns:**
- `WalletConnectAdapter` class that listens to WC `session_request` events and dispatches to `ProviderEngine`
- Session proposal → `requestAccounts` mapping
- WC namespace → chain management mapping
- WC-specific response formatting (WC expects `{ id, jsonrpc, result }` envelope)
- Auto-approve logic for read-only methods (WC doesn't need UI for `eth_chainId`)

**Key interface:**

```typescript
import { ProviderEngine } from '@rainbow-me/provider';
import { Web3Wallet } from '@walletconnect/web3wallet';

class WalletConnectAdapter {
  constructor(config: {
    engine: ProviderEngine;
    web3wallet: Web3Wallet;
  });

  /** Start listening to WC session events */
  activate(): void;

  /** Stop listening */
  deactivate(): void;
}
```

**How it works:**

```typescript
// Inside WalletConnectAdapter
web3wallet.on('session_request', async (event) => {
  const { topic, params, id } = event;
  const { request, chainId } = params;

  // Normalize WC request → standard { method, params }
  const result = await engine.handle(
    { method: request.method, params: request.params },
    {
      origin: session.peer.metadata.url,
      chainId: parseInt(chainId.split(':')[1]),
      source: 'walletconnect',
      wcTopic: topic,
    },
  );

  // Format response back to WC
  await web3wallet.respondSessionRequest({ topic, response: { id, jsonrpc: '2.0', result } });
});
```

**WC-specific quirks handled here, not in the engine:**
- `session_proposal` → maps to connect flow with multi-chain namespace negotiation
- `session_delete` → maps to disconnect
- Chain ID format conversion (`eip155:1` ↔ `1`)
- WC error codes (5000 series) ↔ EIP-1193 error codes (4xxx series)
- Response envelope wrapping

**oRPC contracts:** Not needed for WC — the WC SDK already has its own type system. The adapter translates WC types into the engine's typed inputs.

---

### 4. `@rainbow-me/provider-eip2255`

Wallet permissions middleware. oRPC contracts co-located.

```typescript
import { eip2255Middleware } from '@rainbow-me/provider-eip2255';

const engine = new ProviderEngine(adapter, [
  eip2255Middleware({ permissionStore }),
]);
```

---

### 5. `@rainbow-me/provider-eip5792`

Wallet call batching middleware. oRPC contracts co-located.

```typescript
import { eip5792Middleware } from '@rainbow-me/provider-eip5792';

const engine = new ProviderEngine(adapter, [
  eip5792Middleware({ delegation: delegationModule }),
]);
```

---

### 6. `@rainbow-me/provider-inpage`

Browser-extension-specific inpage script. **Not used by mobile.**

**Owns:**
- oRPC client with `PostMessageLink` (window.postMessage transport)
- `window.ethereum` / `window.rainbow` injection
- `announceProvider()` for EIP-6963
- Wallet router, document type guards
- Bundle config for `inpage.js`

---

## Decoupling RPC from Execution: The RequestGate Pattern

The core insight: **RPC method handling is business logic** (validate params, check session, route to signer), but **execution requires UI** (show approval screen, wait for user). These must be separated.

### Current state (extension)

```
handleProviderRequest() receives eth_sendTransaction
  → addPendingRequest(request)           // extension-specific queue
  → openWindowForTabId(tabId)            // chrome.windows.create — extension-specific
  → waitForPendingRequest(request.id)    // blocks on mitt event emitter
  → popup shows SendTransaction component
  → user clicks approve
  → popup calls approvePendingRequest() via oRPC to background
  → mitt emits, waitForPendingRequest resolves
  → result returned to dApp
```

This works but is completely non-portable. The mobile app can't use `chrome.windows.create`.

### New state (provider engine + RequestGate)

```
ProviderEngine.handle({ method: 'eth_sendTransaction', params })
  → middleware pipeline runs (rate limit, session check, etc.)
  → methodRouterMiddleware identifies this needs signing
  → adapter.sendTransaction() is called
  → inside adapter: requestGate.requestApproval({ type: 'send_transaction', ... })
  → gate SUSPENDS — returns a Promise
  │
  ├── Extension: approval UI shows via popup window (same as today)
  ├── Mobile dApp browser: approval UI shows via React Navigation modal
  ├── Mobile WalletConnect: approval UI shows via bottom sheet
  │
  → user approves/rejects
  → gate resolves/rejects
  → adapter completes signing + submission
  → result flows back through middleware
  → result returned to caller (inpage or WC adapter)
```

### The UI drivers live in this monorepo

The `@rainbow-me/provider` package defines the **driver interfaces** — what information the UI needs and what responses it must produce. The actual UI rendering is platform-specific, but the **business logic that drives it** (transaction simulation, gas estimation, risk warnings, balance checks) lives here:

```typescript
// packages/provider/src/drivers/sendTransaction.ts

interface SendTransactionDriver {
  /** Prepare the transaction for display — simulate, estimate gas, check balance */
  prepare(tx: TransactionRequest, context: RequestContext): Promise<PreparedTransaction>;

  /** After user approves, execute the signed transaction */
  execute(tx: PreparedTransaction, approval: SendApproval): Promise<Hash>;
}

interface PreparedTransaction {
  // Everything the UI needs to render an approval screen
  request: TransactionRequest;
  simulation: SimulationResult | null;
  gasEstimate: GasEstimate;
  balanceSufficient: boolean;
  riskWarnings: RiskWarning[];
  // The UI renders this data. It doesn't compute it.
}
```

The platform UI is a thin shell:

```typescript
// In the extension (popup):
function SendTransactionApproval({ prepared, onApprove, onReject }) {
  // Just renders the PreparedTransaction data
  // No business logic here — just layout
  return (
    <ApprovalSheet>
      <TransactionSummary simulation={prepared.simulation} />
      <GasFeeDisplay estimate={prepared.gasEstimate} />
      {prepared.riskWarnings.map(w => <Warning key={w.id} warning={w} />)}
      <Button onClick={() => onApprove({ gasLimit: prepared.gasEstimate.limit })}>Confirm</Button>
      <Button onClick={onReject}>Reject</Button>
    </ApprovalSheet>
  );
}
```

---

## Shared Interface: How Dapp Browser and WalletConnect Converge

Both callers share the same `ProviderEngine` instance. The engine doesn't know or care which caller invoked it. The `RequestContext` carries metadata about the source:

```typescript
interface RequestContext {
  /** The dApp's origin (URL host) */
  origin: string;

  /** Active chain for this request */
  chainId: number;

  /** Where the request came from */
  source: 'dapp-browser' | 'walletconnect';

  /** WC-specific: session topic (undefined for dApp browser) */
  wcTopic?: string;

  /** WC-specific: request ID for response routing */
  wcRequestId?: number;

  /** Extension-specific: tab ID for popup routing */
  tabId?: number;
}
```

Middleware can branch on `source` for the rare cases where behavior differs:

```typescript
// Example: WC sessions support multiple chains, dApp browser has one active chain
const sessionMiddleware: Middleware = async (request, context, next) => {
  if (context.source === 'walletconnect') {
    // WC: chainId comes from the request's CAIP-2 namespace
    // Validate against the approved WC session namespaces
  } else {
    // Dapp browser: chainId comes from the active AppSession
  }
  return next();
};
```

But the method router, signing logic, transaction execution, gas estimation, and UI drivers are 100% shared.

---

## Adopting in `rainbow-me/rainbow` (Mobile App)

The mobile app has two provider callers: **dApp browser** (in-app WebView) and **WalletConnect** (remote dApps). Today these are separate implementations. After adoption, both use the same engine.

### Integration architecture

```typescript
// In the mobile app's initialization

import { ProviderEngine } from '@rainbow-me/provider';
import { WalletConnectAdapter } from '@rainbow-me/provider-walletconnect';

// 1. Create the shared engine (one per app lifecycle)
const engine = new ProviderEngine(mobileWalletAdapter, [
  eip2255Middleware({ permissionStore }),
  eip5792Middleware({ delegation }),
]);

// 2. Wire up WalletConnect
const wcAdapter = new WalletConnectAdapter({
  engine,
  web3wallet, // from @walletconnect/web3wallet initialization
});
wcAdapter.activate();

// 3. Wire up dApp browser WebView
// The WebView injects provider-inpage's JS bundle
// Communication: WebView.postMessage ↔ RN onMessage handler → engine.handle()
```

### Mobile WalletAdapter implementation

```typescript
class MobileWalletAdapter implements WalletAdapter {
  constructor(
    private keychain: MobileKeychain,
    private requestGate: RequestGate,
    private sendTxDriver: SendTransactionDriver,
  ) {}

  async sendTransaction(params: SendTransactionParams): Promise<Hash> {
    // 1. Prepare (simulate, estimate gas) — shared business logic from provider
    const prepared = await this.sendTxDriver.prepare(params.transaction, params.context);

    // 2. Request UI approval — suspends until user responds
    const approval = await this.requestGate.requestApproval({
      type: 'send_transaction',
      origin: params.context.origin,
      transaction: prepared,
    });

    // 3. Execute — shared business logic
    return this.sendTxDriver.execute(prepared, approval);
  }

  async signMessage(params: SignMessageParams): Promise<Hex> {
    await this.requestGate.requestApproval({
      type: 'sign_message',
      origin: params.context.origin,
      message: params.message,
      method: params.method,
    });

    const account = await this.keychain.getAccount(params.address);
    return account.signMessage({ message: params.message });
  }
  // ... other methods
}
```

### Mobile RequestGate implementation

```typescript
class MobileRequestGate implements RequestGate {
  private navigation: NavigationService;

  async requestApproval<T>(request: ApprovalRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      // Navigate to the approval screen
      this.navigation.navigate('ApprovalSheet', {
        request,
        onApprove: (payload: T) => resolve(payload),
        onReject: () => reject(new UserRejectedRequestError()),
      });
    });
  }
}
```

### What changes in the mobile codebase

| Current (mobile) | After |
|---|---|
| Custom WC session_request handler per method | `WalletConnectAdapter` maps all requests to engine |
| Separate dApp browser RPC handling | Same engine, different transport |
| WC-specific signing logic | Shared `WalletAdapter.signMessage()` |
| WC-specific transaction logic | Shared `WalletAdapter.sendTransaction()` |
| Duplicated gas estimation / simulation | Shared `SendTransactionDriver.prepare()` |
| Platform-specific error mapping | Engine handles standard EIP-1193 errors; WC adapter converts to WC error codes |

### Mobile migration steps

1. **Add packages:** `yarn add @rainbow-me/provider @rainbow-me/provider-walletconnect @rainbow-me/provider-eip2255 @rainbow-me/provider-eip5792`
2. **Implement `MobileWalletAdapter`** — wraps existing keychain and signing code
3. **Implement `MobileRequestGate`** — wraps existing React Navigation approval flow
4. **Create `WalletConnectAdapter` instance** — replace existing WC session_request handler
5. **Wire dApp browser WebView** — inject `provider-inpage` bundle, bridge postMessage to engine
6. **Delete duplicated RPC handling** — single source of truth is now the engine

---

## EIP Coverage

| EIP | Standard | Where it lives | Status |
|-----|----------|----------------|--------|
| **EIP-1193** | Provider API | `provider-eip1193` — the provider IS this | Core |
| **EIP-6963** | Multi Injected Provider Discovery | `provider-inpage` calls `mipd` directly | Extension only |
| **EIP-2255** | Wallet Permissions | `provider-eip2255` middleware | New |
| **EIP-5792** | Wallet Call Batching | `provider-eip5792` middleware | New |
| **EIP-3085** | `wallet_addEthereumChain` | `provider` method router → `WalletAdapter.addChain()` | Core |
| **EIP-3326** | `wallet_switchEthereumChain` | `provider` method router → `WalletAdapter.switchChain()` | Core |
| **EIP-747** | `wallet_watchAsset` | `provider` method router → `WalletAdapter` | Core |
| **EIP-7702** | Account delegation | External: `@rainbow-me/delegation` via `TransactionExecutor` | External |

---

## oRPC Architecture

oRPC contracts are co-located with their implementations in each package. No separate contracts package.

### Where contracts live

```
packages/provider/src/methods/
├── eth_requestAccounts.ts     ← contract + procedure
├── eth_sendTransaction.ts     ← contract + procedure
├── personal_sign.ts           ← contract + procedure
├── eth_signTypedData_v4.ts    ← contract + procedure
├── wallet_switchEthereumChain.ts
├── wallet_addEthereumChain.ts
├── wallet_watchAsset.ts
└── index.ts                   ← re-exports all contracts + router

packages/eip2255/src/
├── methods/
│   ├── wallet_requestPermissions.ts  ← contract + middleware
│   ├── wallet_getPermissions.ts
│   └── wallet_revokePermissions.ts
└── index.ts

packages/eip5792/src/
├── methods/
│   ├── wallet_sendCalls.ts
│   ├── wallet_getCapabilities.ts
│   └── wallet_getCallsStatus.ts
└── index.ts
```

### Extension message flow (oRPC)

```
inpage: orpcClient.eth_requestAccounts()           ← typed
  → PostMessageLink (window.postMessage)
    → content script relay (transparent bridge)
      → chrome.runtime
        → RPCHandler(providerRouter)                ← typed procedures
```

### Mobile message flow (dApp browser)

```
WebView JS: provider.request({ method, params })   ← standard EIP-1193
  → window.ReactNativeWebView.postMessage()
    → RN onMessage handler
      → engine.handle({ method, params }, context)  ← direct call
```

### Mobile message flow (WalletConnect)

```
Remote dApp → WC relay → @walletconnect/web3wallet
  → session_request event
    → WalletConnectAdapter.onSessionRequest()
      → engine.handle({ method, params }, context)  ← direct call
        → (middleware pipeline → adapter → gate → UI → result)
      → web3wallet.respondSessionRequest({ result })
```

---

## viem Integration Strategy

1. **Provider IS `EIP1193Provider`** — viem's type, not a custom one
2. **`custom(provider)`** works out of the box for wallet clients
3. **Read-only RPC** — `WalletAdapter.rpcRequest()` delegates to viem `PublicClient`
4. **Signing** — viem `Account` abstraction (`privateKeyToAccount`, `toAccount`)
5. **Drop ethers.js** — Remove `clientToProvider` bridge

---

## Signer Migration (ethers.js → viem)

### Software Wallets: `RainbowSigner` → viem `LocalAccount`

```typescript
import { privateKeyToAccount } from 'viem/accounts';
// new RainbowSigner(privateKey, provider)  →  privateKeyToAccount(privateKey)
```

### Hardware Wallets: `HWSigner` → viem `CustomAccount`

```typescript
import { toAccount } from 'viem/accounts';
const hardwareAccount = toAccount({
  address: hwAddress,
  signMessage: ({ message }) => ledgerDevice.signPersonalMessage(message),
  signTransaction: (tx) => ledgerDevice.signTransaction(tx),
  signTypedData: (typedData) => ledgerDevice.signTypedData(typedData),
});
```

---

## Transaction Module Binding

```
@rainbow-me/provider
    │
    ├── WalletAdapter.sendTransaction()
    │       ├── Simple send → viem walletClient.sendTransaction()
    │       ├── Swap/Bridge → @rainbow-me/transactions (future)
    │       └── Batched (EIP-5792) → @rainbow-me/delegation
    │
    └── eip5792Middleware
            └── TransactionExecutor interface
                ├── @rainbow-me/delegation
                └── @rainbow-me/transactions (future)
```

---

## Testing Strategy

No separate test-utils package. `DirectLink` (in-process oRPC link) exported from `@rainbow-me/provider/testing`.

### Unit Tests (per package)
- `provider`: Middleware pipeline, method routing, rate limiting, RequestGate, UI drivers
- `provider-eip1193`: Event emission, request forwarding, state
- `provider-walletconnect`: WC event → engine call mapping, error code translation, namespace handling
- `eip2255`: Permission granting, revocation, caveats
- `eip5792`: Capability reporting, call batching, status

### Integration Tests (in `provider`)
```typescript
import { createTestEngine } from '@rainbow-me/provider/testing';

const { engine, gate } = createTestEngine({
  accounts: ['0xabc...'],
  chainId: 1,
});

// Auto-approve all requests in tests
gate.autoApprove();

const accounts = await engine.handle(
  { method: 'eth_requestAccounts' },
  { origin: 'https://example.com', chainId: 1, source: 'dapp-browser' },
);
expect(accounts).toEqual(['0xabc...']);
```

### WalletConnect integration tests
```typescript
import { WalletConnectAdapter } from '@rainbow-me/provider-walletconnect';
import { createTestEngine } from '@rainbow-me/provider/testing';
import { createMockWeb3Wallet } from '@rainbow-me/provider-walletconnect/testing';

const { engine, gate } = createTestEngine({ accounts: ['0xabc...'], chainId: 1 });
const mockWallet = createMockWeb3Wallet();
const wcAdapter = new WalletConnectAdapter({ engine, web3wallet: mockWallet });
wcAdapter.activate();

gate.autoApprove();

// Simulate WC session_request
mockWallet.emit('session_request', {
  topic: 'abc',
  params: { request: { method: 'personal_sign', params: ['0xdeadbeef', '0xabc...'] }, chainId: 'eip155:1' },
  id: 1,
});

// Verify WC got a response
expect(mockWallet.respondSessionRequest).toHaveBeenCalledWith(
  expect.objectContaining({ response: expect.objectContaining({ result: expect.any(String) }) }),
);
```

---

## Migration Path

### Phase 1: Core engine + EIP-1193 provider
- Set up monorepo with turborepo
- Implement `ProviderEngine`, `WalletAdapter`, `RequestGate`, UI driver interfaces
- oRPC contracts co-located per method
- Implement `RainbowEIP1193Provider`
- `DirectLink` for testing
- Integration test suite

### Phase 2: WalletConnect adapter
- Implement `WalletConnectAdapter` mapping WC events → engine
- WC-specific quirk handling (namespaces, error codes, response format)
- Test with mock `Web3Wallet`

### Phase 3: EIP middleware
- `provider-eip2255` — permissions
- `provider-eip5792` — wallet call batching

### Phase 4: Browser extension inpage
- `PostMessageLink` (oRPC client link over window.postMessage)
- Content script relay
- Inpage entry point + bundle config

### Phase 5: Integrate into browser extension
- Implement `ExtensionWalletAdapter` (replacing `handleProviderRequest.ts`)
- Implement `ExtensionRequestGate` (wraps existing `usePendingRequestStore` pattern)
- Wire oRPC `RPCHandler` on chrome.runtime listener
- Replace `@rainbow-me/provider` v0.1.3
- Delete old transport/messenger code

### Phase 6: Integrate into mobile app
- Implement `MobileWalletAdapter` (wraps existing keychain)
- Implement `MobileRequestGate` (wraps React Navigation)
- Wire `WalletConnectAdapter` (replaces existing WC session_request handler)
- Wire dApp browser WebView ↔ engine
- Delete duplicated RPC handling code

---

## Key Files in Browser Extension to Modify

| Current File | Action |
|---|---|
| `src/entries/inpage/index.ts` | Replace with `@rainbow-me/provider-inpage` |
| `src/entries/background/handlers/handleProviderRequest.ts` | Replace with `ExtensionWalletAdapter` + `ProviderEngine` |
| `src/core/transports/providerRequestTransport.ts` | Delete — replaced by oRPC PostMessageLink |
| `src/core/messengers/internal/bridge.ts` | Simplify — relay raw oRPC messages |
| `src/core/state/requests/index.ts` | Becomes `ExtensionRequestGate` (same pattern, typed interface) |
| `src/entries/popup/pages/messages/ApprovalAppRequest.tsx` | Thin shell rendering `PreparedTransaction` from UI drivers |
| `src/core/viem/clientToProvider.ts` | Delete |
| `src/core/keychain/RainbowSigner.ts` | Migrate to viem `LocalAccount` |
| `package.json` | Replace `@rainbow-me/provider` 0.1.3 with new packages |
