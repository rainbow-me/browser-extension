#!/bin/bash

# Source the common test runner
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-runner-common.sh"

# Run serial tests with Anvil (Optimism chain)
run_tests_with_retry "e2e/serial/$1" "./e2e/serial/vitest.config.ts" "true" "yarn anvil:optimism --chain-id 1338"
