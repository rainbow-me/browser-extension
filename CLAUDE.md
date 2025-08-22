# CLAUDE.md

## Repository Overview

Rainbow is a cryptocurrency wallet browser extension built with TypeScript, React, and Manifest V3. It supports multiple blockchain networks, hardware wallets, and provides a comprehensive DeFi experience.

## Common Development Commands

### Setup & Installation

```bash
# Install dependencies and set up the project
yarn install
yarn setup
```

### Development

```bash
# Start development build with hot reload
yarn dev

# Build production extension
yarn build
```

### Testing

```bash
# Run unit/integration tests
yarn test

# Run E2E tests with new proxy system
# First: Start Anvil (required for blockchain interactions)
yarn anvil

# Quick test using helper script
./e2e/scripts/run-proxy-test.sh replay  # Use saved API responses
./e2e/scripts/run-proxy-test.sh record  # Record new API responses

# Manual test commands
TEST_MODE=replay yarn vitest run e2e/serial/swap/1_swapFlow1_NEW.test.ts -c e2e/serial/vitest.config.ts

# Legacy E2E tests (being phased out)
yarn e2e                 # All browsers
yarn e2e:mac:chrome      # Chrome only
yarn e2e:mac:firefox     # Firefox only

# Run specific E2E test suites
yarn vitest:parallel     # Parallel E2E tests
yarn vitest:serial       # Serial E2E tests
yarn vitest:swap         # Swap feature tests
yarn vitest:send         # Send feature tests
yarn vitest:send:optimism # Optimism send tests
yarn vitest:dappInteractions # DApp interaction tests
```

### Code Quality

```bash
# Run linter
yarn lint

# Run type checking
yarn typecheck

# Both should pass before committing changes
```

## Architecture Overview

### Entry Points (`/src/entries/`)

- **background/**: Service worker handling extension lifecycle, message routing, and background tasks
- **popup/**: Main extension UI - React app with routing, wallet management, and DeFi features
- **content/**: Scripts injected into web pages for dApp communication
- **inpage/**: Provider scripts injected into page context for Web3 interactions
- **iframe/**: Isolated frame for secure transaction approvals

### Core Systems (`/src/core/`)

- **keychain/**: Cryptographic key management, wallet generation, and hardware wallet integration
- **state/**: Zustand stores managing wallets, transactions, settings, and assets
- **resources/**: React Query-based API resources for blockchain data
- **network/**: HTTP clients for Rainbow backend, GraphQL, and blockchain providers
- **wagmi/**: Ethereum interaction layer with provider management
- **messengers/**: Cross-context communication system for extension components
- **raps/**: Rainbow Action Protocol - composable transaction flows (swap, send, bridge)

### State Management

The codebase uses `createRainbowStore` - a custom Zustand wrapper providing:

- Chrome storage persistence with throttled writes
- Full TypeScript support with inferred types
- Schema versioning and migration system
- Subscription management for reactive updates

Key stores include: `currentSettings`, `wallets`, `transactions`, `assets`, `networks`, `nfts`, `favorites`

### Testing Strategy

- **Unit Tests**: Colocated with source files (`*.test.ts`), focusing on utilities and core logic
- **E2E Tests**: Separated into parallel (`/e2e/parallel/`) and serial (`/e2e/serial/`) suites
- **Test Utilities**: Helper functions in `/e2e/helpers.ts` for common test operations
- **Proxy-Based E2E Testing**: New MITM proxy system for network-level mocking

#### E2E Testing System (New)

The codebase now includes a proxy-based E2E testing system that intercepts network traffic:

```bash
# One-time setup: Generate CA certificate
node e2e/scripts/generate-ca-cert.js

# Run tests with different modes
./e2e/scripts/run-proxy-test.sh record   # Capture real API responses
./e2e/scripts/run-proxy-test.sh replay   # Use saved responses (default)
./e2e/scripts/run-proxy-test.sh passthrough # No mocking
```

Key features:
- **No production code changes**: Network-level interception (no IS_TESTING flag needed)
- **Automatic recording**: Captures real API responses to `e2e/fixtures/*/recordings.json`
- **Deterministic testing**: Replay mode ensures consistent results
- **CI/CD ready**: Committed recordings enable reliable CI testing

See `/e2e/README.md` for detailed documentation.

### Security Architecture

- Manifest V3 provides runtime isolation and CSP-based network firewall
- LavaMoat protects build process from supply chain attacks
- Hardware wallet support via WebUSB/HID for secure key management
- Encrypted keychain storage using browser-passworder

## Key Development Patterns

### Import Paths

- Use `~/` alias for internal imports (e.g., `~/core/types/assets`)
- Absolute imports from `src/` are configured in TypeScript

### Component Development

- Components live in `/src/entries/popup/components/`
- Design System components in `/src/design-system/components/`
- Use Vanilla Extract for styling (`.css.ts` files)
- Documentation via `.docs.tsx` files for Design System

### Adding New Features

1. Check existing patterns in similar features
2. Use appropriate state stores from `/src/core/state/`
3. Add GraphQL queries to `/src/core/graphql/` if needed
4. Implement UI in `/src/entries/popup/`
5. Add tests following existing patterns
6. Run `yarn lint` and `yarn typecheck` before committing

### Working with Blockchain Data

- Use wagmi hooks for blockchain interactions
- Resources in `/src/core/resources/` handle data fetching
- RAPs in `/src/core/raps/` for complex transaction flows
- Network configuration in `/src/core/state/networks/`

### PR instructions

- Prefix commits and PR titles with a type such as fix, feat, or chore, for example: fix: resolve login bug.
- Never modify any CHANGELOG.md files. These are managed automatically.
- Only modify en-US.json locale files; never adjust other locale JSON files.
