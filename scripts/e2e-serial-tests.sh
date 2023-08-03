#!/bin/bash
ANVIL_PORT=8545

# Launch anvil in the bg
pkill -f anvil
yarn anvil --chain-id 1337 > anvil-e2e.log 2>&1 &
echo "Launching Anvil..."

# Give it some time to boot
interval=5
until nc -z localhost $ANVIL_PORT; do
  sleep $interval
  interval=$((interval * 2))
done

# Check if Anvil has launched successfully
if ! nc -z localhost $ANVIL_PORT; then
  echo "Anvil failed to launch within the timeout."
  exit 1
fi
echo "Anvil Launched..."

# Run the tests and store the result
echo "Running Tests..."
yarn vitest e2e/serial/$1 --config ./e2e/serial/vitest.config.ts --reporter=verbose 

# Store exit code
TEST_EXIT_CODE=$?

# kill anvil
echo "Cleaning Up..."
kill %1 || true

# return the result of the tests
exit "$TEST_EXIT_CODE"
