#!/bin/bash
ANVIL_PORT=8545
RETRY_COUNT=0

# Auto-setup Chrome 138 if available
if [ -d "chrome-138" ]; then
  export CHROMIUM_BIN=$(find chrome-138 -name "Google Chrome for Testing" -type f | head -1)
  echo "Using Chrome 138: $CHROMIUM_BIN"
fi

# Function to launch and verify Anvil
launch_anvil() {
  # Launch anvil in the bg
  yarn anvil:kill
  yarn anvil --chain-id 1337 &
  echo "Launching Anvil..."

  # Give it some time to boot
  interval=5
  until nc -z localhost $ANVIL_PORT; do
    sleep $interval
    interval=$((interval * 2))
  done
  echo "Anvil Launched..."
}

# Function to run tests
run_tests() {
  echo "Running Tests..."
  yarn vitest e2e/serial/$1 --config ./e2e/serial/vitest.config.ts --reporter=verbose --bail 1
}

# Main loop for retry logic
TEST_RESULT=1
while [ $RETRY_COUNT -lt ${MAX_RETRIES:-1} ] && [ $TEST_RESULT -ne 0 ]; do
  if [ $RETRY_COUNT -gt 0 ]; then
    echo "Test failed, attempting retry $RETRY_COUNT..."
  fi
  
  launch_anvil
  run_tests $1
  TEST_RESULT=$?
  
  # kill anvil
  echo "Cleaning Up..."
  yarn anvil:kill

  RETRY_COUNT=$((RETRY_COUNT+1))
done

# Return the result of the tests
exit $TEST_RESULT
