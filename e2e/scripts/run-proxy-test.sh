#!/bin/bash

# Proxy-based E2E Test Runner
# Usage: ./run-proxy-test.sh [mode] [test-file] [build]
# mode: record, replay, or passthrough (default: replay)
# test-file: path to test file (default: e2e/serial/swap/1_swapFlow1_NEW.test.ts)
# build: "build" to rebuild extension, "skip" to skip (default: skip)

set -e

MODE=${1:-replay}
TEST_FILE=${2:-e2e/serial/swap/1_swapFlow1_NEW.test.ts}
BUILD=${3:-skip}

echo "
===========================================
🚀 Running E2E Test with Proxy
Mode: $MODE
Test: $TEST_FILE
===========================================
"

# Build if requested
if [ "$BUILD" = "build" ]; then
    echo "📦 Building extension..."
    USE_PROXY_ONLY=true yarn build:webpack
fi

# Check if anvil is running
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Anvil not running. Starting anvil in background..."
    yarn anvil > /dev/null 2>&1 &
    ANVIL_PID=$!
    sleep 3
    echo "✅ Anvil started"
fi

# Run the test
echo "🧪 Running test in $MODE mode..."
TEST_MODE=$MODE USE_PROXY_ONLY=true yarn vitest run "$TEST_FILE" -c e2e/serial/vitest.config.ts

# Kill anvil if we started it
if [ ! -z "$ANVIL_PID" ]; then
    echo "🛑 Stopping anvil..."
    kill $ANVIL_PID 2>/dev/null || true
fi

echo "✅ Test complete!"
