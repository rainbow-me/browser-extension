#!/bin/bash

# Launch anvil in the bg
yarn anvil &
# Give it some time to boot
sleep 5
# Run the tests and store the result
vitest
TEST_RESULT=$?
# kill anvil
yarn anvil:kill
# return the result of the tests
exit "$TEST_RESULT"

