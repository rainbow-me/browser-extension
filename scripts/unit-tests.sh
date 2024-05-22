#!/bin/bash
ANVIL_PORT=8545

# Automatically export all variables
set -a  
source .env
set +a 

# Launch anvil in the bg
yarn anvil:kill
yarn anvil > anvil-unit.log 2>&1 &
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
NODE_OPTIONS='--no-experimental-fetch' vitest
TEST_RESULT=$?

# kill anvil
echo "Cleaning Up..."
yarn anvil:kill

# return the result of the tests
exit "$TEST_RESULT"
