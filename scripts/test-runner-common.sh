#!/bin/bash

# Common test runner with smart retry logic
# Supports both parallel and serial tests with optional Anvil setup

set -euo pipefail

# Configuration
ANVIL_PORT="${ANVIL_PORT:-8545}"
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-2}"

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to launch and verify Anvil
launch_anvil() {
    local anvil_cmd="${1:-yarn anvil --chain-id 1337}"
    
    log_info "Stopping any existing Anvil instances..."
    yarn anvil:kill 2>/dev/null || true
    
    log_info "Launching Anvil with command: $anvil_cmd"
    eval "$anvil_cmd &"
    local anvil_pid=$!
    
    # Wait for Anvil to be ready
    local wait_time=0
    local max_wait=30
    while ! nc -z localhost $ANVIL_PORT 2>/dev/null; do
        if [ $wait_time -ge $max_wait ]; then
            log_error "Anvil failed to start within ${max_wait} seconds"
            kill $anvil_pid 2>/dev/null || true
            return 1
        fi
        sleep 1
        ((wait_time++))
    done
    
    log_success "Anvil launched successfully (PID: $anvil_pid)"
    echo $anvil_pid
}

# Function to extract failed test names from Vitest output
extract_failed_tests() {
    local output="$1"
    local failed_tests=""
    
    # Try to extract test names from various Vitest output formats
    # Format 1: Standard reporter
    failed_tests=$(echo "$output" | grep -E "^\s*✖|FAIL" | sed -n 's/.*✖\s*\(.*\)/\1/p' | tr '\n' ' ')
    
    # Format 2: Verbose reporter (what they're currently using)
    if [ -z "$failed_tests" ]; then
        failed_tests=$(echo "$output" | grep -A1 "FAIL" | grep -E "^\s+✓\s+|^\s+✖\s+" | sed 's/^\s*✖\s*//' | tr '\n' ' ')
    fi
    
    echo "$failed_tests"
}

# Function to run tests with retry logic
run_tests_with_retry() {
    local test_path="$1"
    local test_config="${2:-}"
    local use_anvil="${3:-false}"
    local anvil_cmd="${4:-}"
    
    local attempt=0
    local test_result=1
    local failed_tests=""
    local test_output=""
    local anvil_pid=""
    
    while [ $attempt -lt $MAX_RETRIES ] && [ $test_result -ne 0 ]; do
        ((attempt++))
        
        if [ $attempt -gt 1 ]; then
            log_warning "Test failed, attempting retry $attempt of $MAX_RETRIES..."
            
            # Exponential backoff between retries
            local wait_time=$((RETRY_DELAY ** attempt))
            log_info "Waiting ${wait_time} seconds before retry..."
            sleep $wait_time
        else
            log_info "Running tests (attempt $attempt of $MAX_RETRIES)..."
        fi
        
        # Launch Anvil if needed
        if [ "$use_anvil" = "true" ]; then
            anvil_pid=$(launch_anvil "$anvil_cmd")
            if [ $? -ne 0 ]; then
                log_error "Failed to launch Anvil"
                continue
            fi
        fi
        
        # Build test command
        local test_cmd="yarn vitest $test_path"
        
        # Add config if provided
        if [ -n "$test_config" ]; then
            test_cmd="$test_cmd --config $test_config"
        fi
        
        # Add reporter
        test_cmd="$test_cmd --reporter=verbose"
        
        # If we have specific failed tests from previous run, run only those
        if [ -n "$failed_tests" ] && [ $attempt -gt 1 ]; then
            log_info "Retrying only failed tests: $failed_tests"
            # Note: Vitest doesn't support running specific tests by name from CLI easily
            # We'll need to use pattern matching or modify the approach
            test_cmd="$test_cmd --grep \"$(echo $failed_tests | sed 's/ /|/g')\""
        else
            # First attempt or couldn't extract specific failures - run all with bail
            test_cmd="$test_cmd --bail 1"
        fi
        
        # Run the tests and capture output
        log_info "Executing: $test_cmd"
        test_output=$(eval "$test_cmd" 2>&1 | tee /dev/tty)
        test_result=${PIPESTATUS[0]}
        
        # Extract failed test names for potential retry
        if [ $test_result -ne 0 ]; then
            failed_tests=$(extract_failed_tests "$test_output")
            log_warning "Test execution failed with exit code: $test_result"
            
            # Save screenshots/artifacts if they exist
            if [ -d "screenshots" ] && [ "$(ls -A screenshots)" ]; then
                log_info "Saving test artifacts from attempt $attempt..."
                mkdir -p "screenshots/attempt-$attempt"
                cp -r screenshots/* "screenshots/attempt-$attempt/" 2>/dev/null || true
            fi
        fi
        
        # Clean up Anvil if it was used
        if [ -n "$anvil_pid" ]; then
            log_info "Cleaning up Anvil..."
            kill $anvil_pid 2>/dev/null || true
            yarn anvil:kill 2>/dev/null || true
        fi
    done
    
    # Final result
    if [ $test_result -eq 0 ]; then
        log_success "Tests passed after $attempt attempt(s)"
    else
        log_error "Tests failed after $MAX_RETRIES attempts"
        
        # Consolidate all screenshot attempts if they exist
        if [ -d "screenshots" ]; then
            log_info "Test artifacts saved in screenshots/ directory"
        fi
    fi
    
    return $test_result
}

# Export functions for use in other scripts
export -f log_info
export -f log_success
export -f log_warning
export -f log_error
export -f launch_anvil
export -f extract_failed_tests
export -f run_tests_with_retry 