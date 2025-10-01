# Performance Testing

Tracks extension startup and user flow performance metrics.

## Running Tests

```bash
# Run all performance tests
yarn perf:all

# Run specific test
yarn perf:initial   # Initial load test
yarn perf:wallet    # Wallet import flow test

# Generate/update baseline from test results
yarn perf:generate-baseline
```

## How It Works

1. **Tests** (`*.test.ts`) - Measure performance of specific flows
2. **Collector** (`collect.ts`) - Gathers metrics from browser
3. **Baseline** (`baseline.json`) - Expected performance values
4. **CI Reporting** - Compares results against baseline, warns on regressions

## Updating Baseline

When performance legitimately improves:

```bash
# Run tests and update baseline
yarn perf:generate-baseline

# Or update baseline from existing perf-results.json
node e2e/performance/generate-baseline.js --update-only

# Review and commit baseline.json
git add e2e/performance/baseline.json
git commit -m "Update performance baseline"
```

## Adding New Metrics

1. Add metric collection in `src/entries/background/index.ts` or `src/entries/popup/index.ts`
2. Update `types.ts` with new metric
3. Add to collector in test files
4. Update baseline after testing