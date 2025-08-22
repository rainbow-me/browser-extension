#!/bin/bash

# CI Setup Script for Proxy-based E2E Tests
# This script prepares the CI environment for running proxy-based tests

set -e

echo "🔧 Setting up CI environment for proxy-based E2E tests..."

# 1. Generate CA certificate for MITM proxy
echo "🔐 Generating CA certificate..."
node e2e/scripts/generate-ca-cert.js

# 2. Check if recordings exist
RECORDINGS_FILE="e2e/fixtures/swap-flow-1/recordings.json"
if [ ! -f "$RECORDINGS_FILE" ]; then
    echo "⚠️  Warning: No recordings found at $RECORDINGS_FILE"
    echo "   Tests will fail if running in replay mode."
    echo "   Consider running tests in record mode first or committing recordings."
fi

# 3. Verify Anvil is available
if ! command -v anvil &> /dev/null; then
    echo "⚠️  Anvil not found. Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# 4. Start Anvil in background for tests
echo "🔗 Starting Anvil..."
yarn anvil > /dev/null 2>&1 &
ANVIL_PID=$!
echo "   Anvil started with PID: $ANVIL_PID"

# Save PID for cleanup
echo $ANVIL_PID > .anvil.pid

# 5. Build extension without IS_TESTING flag
echo "📦 Building extension..."
yarn build:webpack

echo "✅ CI setup complete!"
echo ""
echo "To run tests:"
echo "  TEST_MODE=replay yarn vitest run e2e/serial/swap/1_swapFlow1_NEW.test.ts -c e2e/serial/vitest.config.ts"
echo ""
echo "To stop Anvil after tests:"
echo "  kill \$(cat .anvil.pid)"