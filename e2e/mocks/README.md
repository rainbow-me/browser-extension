# E2E Mock System

Response snapshots for E2E tests using MSW + Selenium WebDriver BiDi.

## How It Works

### Replay Mode (Default)
When `MOCK_MODE` is unset or set to `replay`:
1. Intercepts requests to configured endpoints
2. Checks for saved response file based on URL hash
3. If found → returns mocked response from disk
4. If not found → passes through to real network

This ensures tests work even with partial mocks and new endpoints automatically fall back to real APIs.

### Record Mode
When `MOCK_MODE=record`:
1. Intercepts requests to configured endpoints
2. Makes real API calls with configured headers
3. Saves responses to disk (JSON files)
4. Prevents duplicate recordings in same session

## Directory Structure

```
e2e/mocks/
├── swap/
│   ├── quote/      # Swap quote responses
│   └── slippage/   # Swap slippage responses
└── addys/
    ├── assets/     # Address assets responses
    └── summary/    # Account summary responses
```

## Intercepted Endpoints

- `swap.p.rainbow.me/v1/quote`
- `swap.p.rainbow.me/v1/slippage`
- `addys.p.rainbow.me/v3/<chains>/<address>/assets`
- `addys.p.rainbow.me/v3/summary`

## Usage

### Run Tests (Replay Mode)
```bash
yarn e2e
```

### Record New Mocks
```bash
MOCK_MODE=record yarn e2e
```

### Update Mocks
```bash
# Delete specific mock files, then:
MOCK_MODE=record yarn e2e

# Or refresh all:
rm -rf e2e/mocks/*/
MOCK_MODE=record yarn e2e
```

## Configuration

Edit `e2e/mocks/endpoints.ts` to modify intercepted endpoints or add custom headers.

```typescript
{
  host: 'api.example.com',
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
  paths: [
    { pattern: /^\/v1\/resource/, dir: 'example/resource' }
  ]
}
```

## Browser Compatibility Note

**Chrome BiDi Support:** Chrome does not yet support the `network.addDataCollector` and `network.getData` BiDi commands. These commands are part of the [W3C WebDriver BiDi specification](https://www.w3.org/TR/webdriver-bidi/) but are still pending implementation in Chrome. As a fallback, when BiDi fails to deliver response bodies, the system will attempt to fetch the response directly from the network.
