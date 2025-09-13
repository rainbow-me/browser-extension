#!/bin/bash

# Display browser version for debugging
node scripts/e2e-browser-version.js

# Run performance tests with specified configuration
# The retry logic is handled by vitest itself via the config
echo "Running Performance Tests..."
yarn vitest e2e/performance/$1 --config ./e2e/performance/vitest.config.ts --reporter=verbose

# Return the result of the tests
exit $?