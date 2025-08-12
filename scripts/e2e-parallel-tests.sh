#!/bin/bash

# Source the common test runner
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-runner-common.sh"

# Run parallel tests without Anvil
run_tests_with_retry "e2e/parallel/$1" "./e2e/parallel/vitest.config.ts" "false"
