# Test Asset Mocking Strategy

## Overview

The browser extension uses a fetch-intercepting mock system to provide predictable asset balances during E2E tests. This approach maintains production code paths while ensuring consistent test data.

## Why This Approach?

### Problem
- E2E tests were flaky due to unpredictable Anvil blockchain state
- Tests would fail when Anvil setup was slow or unavailable
- Previous conditional logic (`if (IS_TESTING)`) in production code created divergent code paths

### Solution
Mock network responses at the fetch level, leaving production code untouched.

## Architecture

### 1. Mock Registration (`src/entries/popup/index.ts`)
```typescript
if (process.env.IS_TESTING === 'true') {
  await import('../../../e2e/mockFetch').then((m) => m.mockFetch());
}
```

### 2. Mock Service Configuration (`e2e/mockFetch.ts`)
The `mockFetch` function intercepts requests to:
- `swap.p.rainbow.me` - Swap quotes
- `addys.p.rainbow.me` - User asset balances

### 3. Mock Generation (`e2e/generateUserAssetMocks.ts`)
Generates deterministic mock responses for test wallets with predictable balances.

## Test Wallets and Balances

### Standard Test Wallets
All wallets except `EMPTY_WALLET` receive:
- **ETH**: 10,000 ETH
- **USDC**: 50,000 USDC
- **DAI**: 100,000 DAI  
- **Optimism ETH**: 5,000 ETH

### Empty Wallet
`EMPTY_WALLET` (0x3637f053...) receives:
- All balances set to 0

## File Structure

```
e2e/
├── mockFetch.ts                    # Fetch interceptor
├── generateUserAssetMocks.ts       # Mock generator script
└── mocks/
    ├── swap_quotes/                # Swap mock responses
    │   └── [hash].json
    └── user_assets/                # Asset mock responses
        └── [hash].json             # SHA256 hash of URL
```

## Generating Mocks

To regenerate mock files after adding new test wallets or changing balances:

```bash
npx tsx e2e/generateUserAssetMocks.ts
```

This generates mock files for:
- All test wallets from `e2e/walletVariables.ts`
- Multiple chain combinations (mainnet, optimism, both)
- Multiple currencies (USD, EUR)

## How It Works

1. **Test Initialization**: When `IS_TESTING=true`, the extension loads `mockFetch()`
2. **Request Interception**: `mockFetch` intercepts all fetch requests
3. **Mock Matching**: URLs to `addys.p.rainbow.me` are hashed via SHA256
4. **Response Loading**: Corresponding mock file is loaded from `e2e/mocks/user_assets/[hash].json`
5. **Data Return**: Mock response is returned to the application

## Benefits

✅ **No production code changes** - Clean separation of test logic  
✅ **Predictable balances** - Tests always see consistent data  
✅ **Fast response times** - No network calls or blockchain queries  
✅ **Maintainable** - Single source of truth for test data  
✅ **Extensible** - Easy to add new services or test wallets  

## Adding New Test Wallets

1. Add wallet to `e2e/walletVariables.ts`
2. Update `TEST_WALLETS` array in `e2e/generateUserAssetMocks.ts`
3. Run `npx tsx e2e/generateUserAssetMocks.ts`
4. Commit the generated mock files

## Debugging

Enable console logging in `mockFetch.ts` to see:
- Intercepted URLs
- Hash values
- Mock file paths
- Loaded responses

## Migration from IS_TESTING Conditionals

This approach replaces the previous strategy of:
- Conditional logic in `userAssets.ts` and `common.ts`
- Runtime stubbing based on `IS_TESTING` environment variable
- Hybrid stubbing with background fetching

The new approach ensures production code remains unchanged while tests receive consistent, predictable data. 