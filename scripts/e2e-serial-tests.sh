#!/bin/bash
ANVIL_PORT=8545

# Function to check if Anvil is running
is_anvil_running() {
  if nc -z localhost $ANVIL_PORT; then
    echo "Anvil is already running."
    return 0
  else
    echo "Anvil is not running."
    return 1
  fi
}

# Launch Anvil if it's not already running
if ! is_anvil_running; then
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
else
  echo "Using existing Anvil instance."
fi

# Run the tests and store the result
echo "Running Tests..."
yarn vitest e2e/serial/$1 --config ./e2e/serial/vitest.config.ts --reporter=verbose --bail 1

# Store exit code
TEST_RESULT=$?

# return the result of the tests
exit "$TEST_RESULT"
