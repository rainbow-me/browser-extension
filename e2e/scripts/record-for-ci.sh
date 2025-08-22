#!/bin/bash

# Script to record E2E test responses with CI-like configuration
# This ensures recordings match what CI will request

set -e

echo "
===========================================
📹 Recording E2E Tests for CI
===========================================
"

# 1. Ensure we're using the same configuration as CI
echo "🔧 Setting up CI-like environment..."

# 2. Start Anvil if not running
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "🔗 Starting Anvil..."
    yarn anvil > /dev/null 2>&1 &
    ANVIL_PID=$!
    sleep 5
    echo "✅ Anvil started"
else
    echo "✅ Anvil already running"
fi

# 3. Build extension fresh (same as CI)
echo "📦 Building extension (fresh build like CI)..."
yarn build:webpack

# 4. Clear old recordings to start fresh
echo "🗑️  Clearing old recordings..."
rm -f e2e/fixtures/swap-flow-1/recordings.json

# 5. Run test in RECORD mode
echo "📹 Recording new API responses..."
TEST_MODE=record \
  BROWSER=chrome \
  yarn vitest run e2e/serial/swap/1_swapFlow1_NEW.test.ts -c e2e/serial/vitest.config.ts || true

# 6. Check if recordings were created
if [ -f "e2e/fixtures/swap-flow-1/recordings.json" ]; then
    RECORDING_COUNT=$(grep -c '"id"' e2e/fixtures/swap-flow-1/recordings.json || echo "0")
    echo "✅ Recorded $RECORDING_COUNT API calls"
    echo ""
    echo "📊 Recorded domains:"
    grep -o '"url":"[^"]*"' e2e/fixtures/swap-flow-1/recordings.json | cut -d'"' -f4 | cut -d'/' -f3 | sort -u | head -10
else
    echo "❌ No recordings created!"
fi

# 7. Cleanup
if [ ! -z "$ANVIL_PID" ]; then
    echo "🛑 Stopping Anvil..."
    kill $ANVIL_PID 2>/dev/null || true
fi

echo "
===========================================
✅ Recording complete!
Next steps:
1. Review the recordings: e2e/fixtures/swap-flow-1/recordings.json
2. Commit if they look good: git add e2e/fixtures/swap-flow-1/recordings.json
3. Push to test in CI
===========================================
"