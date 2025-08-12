#!/bin/bash

# Enhanced test runner using Vitest's built-in retry mechanism
# This provides true test-level retry (only failed tests are retried)

set -euo pipefail

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-runner-common.sh"

# Function to run tests with Vitest's built-in retry
run_tests_with_vitest_retry() {
    local test_path="$1"
    local test_config="${2:-}"
    local use_anvil="${3:-false}"
    local anvil_cmd="${4:-}"
    
    local max_retries="${MAX_RETRIES:-3}"
    local anvil_pid=""
    
    # Launch Anvil if needed
    if [ "$use_anvil" = "true" ]; then
        anvil_pid=$(launch_anvil "$anvil_cmd")
        if [ $? -ne 0 ]; then
            log_error "Failed to launch Anvil"
            return 1
        fi
    fi
    
    # Build test command with Vitest's retry flag
    local test_cmd="yarn vitest $test_path"
    
    # Add config if provided
    if [ -n "$test_config" ]; then
        test_cmd="$test_cmd --config $test_config"
    fi
    
    # Add Vitest retry configuration
    # This retries only failed tests, not the entire suite
    test_cmd="$test_cmd --retry=$max_retries --reporter=verbose"
    
    # Remove bail flag for retry mode (bail stops on first failure, incompatible with retry)
    # Instead, we'll handle this in the config or use maxConcurrency
    
    log_info "Running tests with Vitest retry (max $max_retries retries per test)..."
    log_info "Executing: $test_cmd"
    
    # Run the tests
    eval "$test_cmd"
    local test_result=$?
    
    # Clean up Anvil if it was used
    if [ -n "$anvil_pid" ]; then
        log_info "Cleaning up Anvil..."
        kill $anvil_pid 2>/dev/null || true
        yarn anvil:kill 2>/dev/null || true
    fi
    
    # Final result
    if [ $test_result -eq 0 ]; then
        log_success "All tests passed (some may have been retried)"
    else
        log_error "Some tests failed even after $max_retries retries"
    fi
    
    return $test_result
}

# Export the function
export -f run_tests_with_vitest_retry 