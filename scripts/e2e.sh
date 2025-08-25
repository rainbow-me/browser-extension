#!/bin/bash

# E2E Test Runner - Unified script for all e2e tests
# Usage:
#   ./scripts/e2e.sh [path]
# Examples:
#   ./scripts/e2e.sh parallel
#   ./scripts/e2e.sh serial/send
#   ./scripts/e2e.sh serial/send/1_sendFlow.test.ts

ANVIL_PORT=8545
TEST_PATH="${1:-}"

# Chain configurations
# Format: "pattern:command:chain_id:description"
CHAIN_CONFIGS=(
  "optimismTransactions:anvil:optimism:1338:Optimism"
  "*:anvil:1337:Mainnet"  # Default fallback
)

# Get Anvil configuration for a test path
get_anvil_config() {
  local path=$1
  
  for config in "${CHAIN_CONFIGS[@]}"; do
    local pattern="${config%%:*}"
    local rest="${config#*:}"
    
    if [[ "$pattern" == "*" ]] || [[ "$path" == *"$pattern"* ]]; then
      echo "$rest"
      return
    fi
  done
}

# Launch Anvil with specified configuration
launch_anvil() {
  local config=$1
  local cmd="${config%%:*}"
  local rest="${config#*:}"
  local chain_id="${rest%%:*}"
  local description="${rest#*:}"
  
  yarn anvil:kill
  
  # Launch anvil with the specified command and chain ID
  yarn "$cmd" --chain-id "$chain_id" &
  echo "Launching Anvil ($description, chain-id: $chain_id)..."
  
  # Wait for Anvil to be ready
  local interval=5
  until nc -z localhost $ANVIL_PORT; do
    sleep $interval
    interval=$((interval * 2))
  done
  echo "Anvil Launched..."
}

# Run tests with vitest
run_tests() {
  local path=$1
  local config=$2
  
  echo "Running Tests: $path"
  yarn vitest "e2e/$path" --config "./e2e/$config/vitest.config.ts" --reporter=verbose --bail 1
}

# Execute tests with retry logic
run_with_retry() {
  local test_path=$1
  local test_config=$2
  local anvil_config=$3
  local retry_count=0
  local test_result=1
  
  while [ $retry_count -lt ${MAX_RETRIES:-1} ] && [ $test_result -ne 0 ]; do
    if [ $retry_count -gt 0 ]; then
      echo "Test failed, attempting retry $retry_count..."
    fi
    
    # Launch Anvil if needed
    if [[ -n "$anvil_config" ]]; then
      launch_anvil "$anvil_config"
    fi
    
    # Run tests
    run_tests "$test_path" "$test_config"
    test_result=$?
    
    # Clean up Anvil if it was launched
    if [[ -n "$anvil_config" ]]; then
      echo "Cleaning Up..."
      yarn anvil:kill
    fi
    
    retry_count=$((retry_count+1))
  done
  
  return $test_result
}

# Parallel tests entrypoint
run_parallel_tests() {
  local path=$1
  run_with_retry "$path" "parallel" ""
}

# Serial tests entrypoint
run_serial_tests() {
  local path=$1
  local anvil_config=$(get_anvil_config "$path")
  run_with_retry "$path" "serial" "$anvil_config"
}

# Main execution
main() {
  # Check browser version before running tests
  node scripts/e2e-browser-version.js
  
  # Determine test type and run appropriate handler
  if [[ "$TEST_PATH" == parallel* ]]; then
    run_parallel_tests "$TEST_PATH"
  elif [[ "$TEST_PATH" == serial* ]]; then
    run_serial_tests "$TEST_PATH"
  else
    # Default to serial for selective tests
    run_serial_tests "$TEST_PATH"
  fi
  
  exit $?
}

# Run main function
main
