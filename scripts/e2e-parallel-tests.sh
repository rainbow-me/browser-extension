#!/bin/bash
RETRY_COUNT=0

# Check browser version before running tests
node scripts/e2e-browser-version.js

# Function to run tests
run_tests() {
  echo "Running Tests..."
  yarn vitest e2e/parallel/$1 --config ./e2e/parallel/vitest.config.ts --reporter=verbose --bail 1
}

# Main loop for retry logic
TEST_RESULT=1
while [ $RETRY_COUNT -lt ${MAX_RETRIES:-1} ] && [ $TEST_RESULT -ne 0 ]; do
  if [ $RETRY_COUNT -gt 0 ]; then
    echo "Test failed, attempting retry $RETRY_COUNT..."
  fi
  
  run_tests $1
  TEST_RESULT=$?

  RETRY_COUNT=$((RETRY_COUNT+1))
done

# Return the result of the tests
exit $TEST_RESULT
