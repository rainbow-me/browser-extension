# E2E Testing

This directory contains end-to-end tests for the Rainbow browser extension using Selenium WebDriver with Vitest.

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
yarn install

# Generate CA certificate for HTTPS interception (one-time setup)
node e2e/scripts/generate-ca-cert.js

# Start Anvil (local blockchain)
yarn anvil
```

### Run Tests

#### Using the Helper Script (Recommended)
```bash
# Run tests with saved responses (default)
./e2e/scripts/run-proxy-test.sh replay

# Record new API responses
./e2e/scripts/run-proxy-test.sh record

# Run against real APIs (no mocking)
./e2e/scripts/run-proxy-test.sh passthrough
```

#### Manual Commands
```bash
# Build extension
yarn build:webpack

# Run specific test
TEST_MODE=replay yarn vitest run e2e/serial/swap/1_swapFlow1_NEW.test.ts -c e2e/serial/vitest.config.ts
```

## 📁 Directory Structure

```
e2e/
├── fixtures/               # Test data and recordings
│   ├── .gitignore         # Ignores local CA certificates
│   └── swap-flow-1/       # Scenario-specific recordings
│       └── recordings.json # Captured API responses
├── helpers/               
│   ├── proxy/             # Proxy implementation
│   │   ├── mitmProxyV2.ts # MITM proxy with TLS support
│   │   └── mockStore.ts   # Legacy mock compatibility
│   └── initDriverWithProxy.ts # WebDriver with proxy setup
├── scripts/               
│   ├── generate-ca-cert.js    # CA certificate generator
│   ├── run-proxy-test.sh      # Test runner script
│   └── ci-setup.sh            # CI environment setup
├── serial/                # Sequential tests
│   └── swap/             # Swap feature tests
└── parallel/             # Parallel tests
```

## 🔧 How It Works

### Proxy-Based Architecture

The new testing system uses a Man-in-the-Middle (MITM) proxy to intercept all network traffic:

```
Test → WebDriver → Chrome → MITM Proxy → Internet/Recordings
                               ↓
                         Intercepts & 
                      Records/Replays
```

### Test Modes

1. **Record Mode** (`TEST_MODE=record`)
   - Captures real API responses
   - Saves to `fixtures/*/recordings.json`
   - Use when adding new tests or updating mocks

2. **Replay Mode** (`TEST_MODE=replay`)
   - Uses saved responses from recordings
   - Default mode for CI/CD
   - Ensures deterministic test results

3. **Passthrough Mode** (`TEST_MODE=passthrough`)
   - Forwards all requests without mocking
   - Useful for debugging

## 🔐 Security

### CA Certificates
- Generated locally via `generate-ca-cert.js`
- **Never committed** to repository (gitignored)
- Each developer/CI generates their own

### Sensitive Data
- Headers like `authorization`, `cookie`, `x-api-key` are automatically redacted
- Test wallets use known test keys only
- No production secrets in recordings

## 🤖 CI/CD Setup

### GitHub Actions

1. Use the example workflow:
```bash
cp .github/workflows/e2e-proxy-tests.yml.example .github/workflows/e2e-proxy-tests.yml
```

2. Or run the CI setup script:
```bash
./e2e/scripts/ci-setup.sh
```

### CI Process
1. Generates CA certificate
2. Starts Anvil fork
3. Builds extension
4. Runs tests in replay mode
5. Uses committed recordings (no external API calls)

### Required CI Steps
```yaml
- name: Generate CA Certificate
  run: node e2e/scripts/generate-ca-cert.js

- name: Start Anvil
  run: anvil --fork-url ${{ secrets.ETH_RPC_URL }} &

- name: Build Extension
  run: yarn build:webpack

- name: Run Tests
  run: TEST_MODE=replay yarn vitest run e2e/serial/swap/*.test.ts
```

## 📝 Writing New Tests

### 1. Create Test File
```typescript
import { MitmProxyV2 } from '../../helpers/proxy/mitmProxyV2';
import { initDriverWithProxy } from '../../helpers/initDriverWithProxy';

let proxy: MitmProxyV2;
let driver: WebDriver;

beforeAll(async () => {
  // Start proxy
  proxy = new MitmProxyV2({
    port: 8080,
    mode: process.env.TEST_MODE as 'record' | 'replay',
    scenarioName: 'my-test-scenario',
  });
  await proxy.start();
  
  // Initialize WebDriver with proxy
  driver = await initDriverWithProxy({
    browser: 'chrome',
    useProxy: true,
    proxyPort: 8080,
  });
});

afterAll(async () => {
  await driver?.quit();
  await proxy?.stop();
});
```

### 2. Record Initial Responses
```bash
TEST_MODE=record yarn vitest run e2e/path/to/your.test.ts
```

### 3. Commit Recordings
```bash
git add e2e/fixtures/my-test-scenario/recordings.json
git commit -m "Add recordings for new test"
```

### 4. Run in CI
Tests will automatically use replay mode with committed recordings.

## 🔄 Updating Recordings

When APIs change or new endpoints are added:

```bash
# Record new responses
TEST_MODE=record ./e2e/scripts/run-proxy-test.sh

# Review changes
git diff e2e/fixtures/*/recordings.json

# Commit if correct
git add e2e/fixtures/*/recordings.json
git commit -m "Update test recordings"
```

## 🐛 Troubleshooting

### Certificate Errors
```bash
# Regenerate certificate
rm -rf e2e/fixtures/certs/
node e2e/scripts/generate-ca-cert.js
```

### Unmocked Requests
- Check test output for "⚠️ No recording found" warnings
- Run test in record mode to capture missing endpoints
- Commit updated recordings

### Port Conflicts
- Default proxy port is 8080
- Change in test file: `new MitmProxyV2({ port: 8081 })`
- Update WebDriver config: `proxyPort: 8081`

### Anvil Not Running
```bash
# Check if running
lsof -i :8545

# Start if needed
yarn anvil
```

## 🚦 Migration from Old System

### Old System (mockFetch)
- Required `IS_TESTING=true` in build
- Runtime mock injection
- Hash-based URL matching
- Manual mock creation

### New System (Proxy)
- No build flags needed
- Network-level interception
- Automatic recording
- Zero bundle impact

### Migration Steps
1. New tests use proxy system
2. Existing tests continue working
3. Gradually migrate old tests
4. Remove `IS_TESTING` flag when complete

## 📚 Additional Documentation

- [Proxy Architecture](./PROXY_ARCHITECTURE.md) - Technical details
- [Helper Functions](./helpers/README.md) - Test utilities
- [CI Setup](./.github/workflows/e2e-proxy-tests.yml.example) - GitHub Actions example

## 💡 Tips

- Always run `yarn anvil` before tests
- Use `record` mode sparingly (only when needed)
- Review recordings before committing
- Keep recordings organized by scenario
- Use descriptive scenario names

## 🏗️ Architecture Details

### Why Proxy-Based Testing?

The proxy approach solves several issues with the old mock injection system:

| Problem (Old System) | Solution (New System) |
|---------------------|----------------------|
| Production code pollution (IS_TESTING flag) | Network-level interception |
| Manual mock creation | Automatic recording from real APIs |
| Hash-based URL matching (fragile) | Direct URL matching |
| Bundle size increase | Zero bundle impact |
| Runtime complexity | Clean separation of concerns |

### How MITM Proxy Works

1. **Certificate Generation**: Creates a self-signed CA certificate for HTTPS interception
2. **Browser Configuration**: Chrome/Firefox configured to trust the CA and use proxy
3. **Request Interception**: All HTTP/HTTPS traffic flows through the proxy
4. **Mode-Based Handling**:
   - **Record**: Forwards to real API, saves response
   - **Replay**: Returns saved response, no external call
   - **Passthrough**: Forwards without recording

### Recording Format

Recordings are stored as JSON with the following structure:

```json
{
  "id": "unique-request-id",
  "timestamp": 1234567890,
  "request": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "headers": { ... },
    "body": "..."
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": { ... },
    "body": "..."
  }
}
```

Sensitive headers are automatically redacted before saving.