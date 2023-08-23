#!/bin/bash

# Launch anvil in the bg
yarn anvil --chain-id 1337 &
# Give it some time to boot (CI is slower)
if [ "$CI" = "true" ]; then
  sleep 15
else
  sleep 5
fi
# Run the tests and store the result
yarn vitest e2e/serial/$1 --config ./e2e/serial/vitest.config.ts
TEST_RESULT=$?
# kill anvil
yarn anvil:kill
# return the result of the tests
exit "$TEST_RESULT"