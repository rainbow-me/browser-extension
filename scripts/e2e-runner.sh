#!/bin/bash

# Unified E2E test runner with flexible retry strategies
# Usage: ./e2e-runner.sh <test-type> <test-path> [options]
#
# Test types: parallel, serial, serial-optimism
# Options:
#   --retry-mode=<shell|vitest>  Choose retry strategy (default: vitest)
#   --max-retries=<number>        Max retry attempts (default: 3)
#   --retry-delay=<seconds>       Delay between retries (default: 2)

set -euo pipefail

# Parse arguments
TEST_TYPE="${1:-}"
TEST_PATH="${2:-}"
RETRY_MODE="${RETRY_MODE:-vitest}"
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-2}"

# Parse additional options
shift 2 || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --retry-mode=*)
            RETRY_MODE="${1#*=}"
            ;;
        --max-retries=*)
            MAX_RETRIES="${1#*=}"
            ;;
        --retry-delay=*)
            RETRY_DELAY="${1#*=}"
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
done

# Validate inputs
if [ -z "$TEST_TYPE" ] || [ -z "$TEST_PATH" ]; then
    echo "Usage: $0 <test-type> <test-path> [options]"
    echo "Test types: parallel, serial, serial-optimism"
    exit 1
fi

# Export environment variables
export MAX_RETRIES
export RETRY_DELAY

# Source the appropriate test runner based on retry mode
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$RETRY_MODE" = "vitest" ]; then
    source "$SCRIPT_DIR/test-runner-vitest.sh"
    RUN_FUNCTION="run_tests_with_vitest_retry"
else
    source "$SCRIPT_DIR/test-runner-common.sh"
    RUN_FUNCTION="run_tests_with_retry"
fi

# Run tests based on type
case $TEST_TYPE in
    parallel)
        echo "🚀 Running parallel tests with $RETRY_MODE retry mode..."
        $RUN_FUNCTION "e2e/parallel/$TEST_PATH" "./e2e/parallel/vitest.config.ts" "false"
        ;;
    serial)
        echo "🚀 Running serial tests with $RETRY_MODE retry mode..."
        $RUN_FUNCTION "e2e/serial/$TEST_PATH" "./e2e/serial/vitest.config.ts" "true" "yarn anvil --chain-id 1337"
        ;;
    serial-optimism)
        echo "🚀 Running Optimism serial tests with $RETRY_MODE retry mode..."
        $RUN_FUNCTION "e2e/serial/$TEST_PATH" "./e2e/serial/vitest.config.ts" "true" "yarn anvil:optimism --chain-id 1338"
        ;;
    *)
        echo "Unknown test type: $TEST_TYPE"
        echo "Valid types: parallel, serial, serial-optimism"
        exit 1
        ;;
esac 