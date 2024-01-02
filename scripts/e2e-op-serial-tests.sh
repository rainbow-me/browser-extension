#!/bin/bash
ANVIL_PORT=8545

# Launch anvil in the bg
yarn anvil:kill
yarn anvil:optimism --chain-id 1338 &
echo "Launching Anvil..."

# Give it some time to boot
interval=5
until nc -z localhost $ANVIL_PORT; do
  sleep $interval
  interval=$((interval * 2))
done
echo "Anvil Launched..."

# Run the tests and store the result
echo "Running Tests..."
yarn vitest e2e/serial/$1 --config ./e2e/serial/vitest.config.ts --reporter=verbose --bail 1

# Store exit code
TEST_RESULT=$?

# kill anvil
echo "Cleaning Up..."
yarn anvil:kill

# return the result of the tests
exit "$TEST_RESULT"
