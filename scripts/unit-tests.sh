#!/bin/bash

# Launch anvil in the bg
yarn anvil &
# Give it some time to boot (CI is slower)
if [ "$CI" = "true" ]; then
  sleep 15
else
  sleep 5
fi
# Run the tests and store the result
vitest
TEST_RESULT=$?
# kill anvil
yarn anvil:kill
# return the result of the tests
exit "$TEST_RESULT"

