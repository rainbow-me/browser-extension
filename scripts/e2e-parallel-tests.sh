#!/bin/bash
# This script runs the parallel e2e tests.

# Source the common test logic script.
source "$(dirname "$0")/common-test-logic.sh"

# Define the test parameters.
# The first argument to this script ($1) is the specific test file or subdirectory to run.
TEST_GLOB="e2e/parallel/${1}"
CONFIG_FILE="./e2e/parallel/vitest.config.ts"
ANVIL_MODE="none" # No Anvil needed for parallel tests.

# Call the common function to execute the tests with retry logic.
run_tests_with_retry "$TEST_GLOB" "$CONFIG_FILE" "$ANVIL_MODE"
