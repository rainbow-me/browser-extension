#!/bin/bash
RETRY_COUNT=0

# Auto-setup Chrome 138 if available
if [ -d "chrome-138" ]; then
  export CHROMIUM_BIN=$(find chrome-138 -name "Google Chrome for Testing" -type f | head -1)
  echo "Using Chrome 138: $CHROMIUM_BIN"
fi

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
