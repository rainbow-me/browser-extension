#!/bin/bash
# This script contains the common logic for running e2e tests with retries.

# Common Anvil port
ANVIL_PORT=8545

# Function to launch a standard Anvil instance
launch_anvil() {
  yarn anvil:kill
  yarn anvil --chain-id 1337 &
  echo "Launching Anvil..."
  # Wait for Anvil to boot
  interval=5
  until nc -z localhost $ANVIL_PORT; do sleep $interval; done
  echo "Anvil Launched."
}

# Function to launch an Optimism Anvil instance
launch_anvil_optimism() {
  yarn anvil:kill
  yarn anvil:optimism --chain-id 1338 &
  echo "Launching Anvil for Optimism..."
  # Wait for Anvil to boot
  interval=5
  until nc -z localhost $ANVIL_PORT; do sleep $interval; done
  echo "Anvil Launched."
}

# The main function to run tests with retry logic.
# Takes three arguments:
# 1. test_glob: The file glob pattern for the initial test run (e.g., "e2e/parallel/*").
# 2. config_file: The path to the vitest config file.
# 3. anvil_mode: "none", "standard", or "optimism".
run_tests_with_retry() {
  local test_glob="$1"
  local config_file="$2"
  local anvil_mode="$3"

  local initial_test_command="yarn vitest $test_glob --config $config_file --reporter=json"
  local retry_test_command="yarn vitest --config $config_file --bail=1"

  # --- Initial Run ---
  if [ "$anvil_mode" = "standard" ]; then launch_anvil; fi
  if [ "$anvil_mode" = "optimism" ]; then launch_anvil_optimism; fi

  echo "Running initial test suite..."
  # We pipe the output to tee to show it in the CI logs in real-time.
  # stderr is redirected to stdout to capture everything in the 'output' variable.
  output=$($initial_test_command 2>&1 | tee /dev/tty)
  local exit_code=${PIPESTATUS[0]}

  if [ "$anvil_mode" != "none" ]; then yarn anvil:kill; fi

  # --- Check and Retry ---
  if [ $exit_code -eq 0 ]; then
    echo "All tests passed on the first run."
    exit 0
  fi

  echo "Initial run failed. Parsing failed tests for retry..."
  # Use jq to robustly parse the file paths of failed tests from the JSON output.
  local failed_tests=$(echo "$output" | jq -r '.testResults[] | select(.status == "fail") | .name')

  if [ -z "$failed_tests" ]; then
    echo "Tests failed, but could not parse failed test files. Exiting."
    exit $exit_code
  fi

  local max_retries=${MAX_RETRIES:-1}
  if [ "$max_retries" -eq 0 ]; then
      echo "Tests failed and no retries left. Exiting."
      exit $exit_code
  fi

  echo "Retrying failed tests..."
  echo "$failed_tests"

  # --- Retry Run ---
  if [ "$anvil_mode" = "standard" ]; then launch_anvil; fi
  if [ "$anvil_mode" = "optimism" ]; then launch_anvil_optimism; fi

  # Run the retry command with only the paths of the failed tests.
  $retry_test_command $failed_tests
  local retry_exit_code=$?

  if [ "$anvil_mode" != "none" ]; then yarn anvil:kill; fi

  exit $retry_exit_code
} 