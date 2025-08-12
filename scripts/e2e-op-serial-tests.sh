#!/bin/bash
# This script runs the Optimism serial e2e tests.

# Source the common test logic script.
source "$(dirname "$0")/common-test-logic.sh"

# Define the test parameters.
TEST_GLOB="e2e/serial/${1}"
CONFIG_FILE="./e2e/serial/vitest.config.ts"
ANVIL_MODE="optimism" # Requires an Optimism-configured Anvil instance.

# Call the common function to execute the tests with retry logic.
run_tests_with_retry "$TEST_GLOB" "$CONFIG_FILE" "$ANVIL_MODE"
