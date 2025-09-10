#!/bin/bash

echo "🚀 Generating Performance Baseline from Local Run"
echo "================================================="
echo ""
echo "This will:"
echo "1. Run the performance tests locally"
echo "2. Generate a baseline from the actual results"
echo ""
echo "Note: Assumes you have already built the extension with IS_TESTING=true"
echo ""

# Run performance tests
echo ""
echo "🧪 Running performance tests..."
yarn vitest:performance

if [ $? -ne 0 ]; then
    echo "❌ Performance tests failed"
    exit 1
fi

# Check if results were generated
if [ ! -f "perf-results.json" ]; then
    echo "❌ No performance results generated"
    exit 1
fi

# Update baseline with the results
echo ""
echo "📊 Updating baseline with actual metrics..."
node scripts/update-perf-baseline.js

echo ""
echo "✅ Baseline generated successfully!"
echo ""
echo "Next steps:"
echo "1. Review the baseline values in e2e/performance/baseline.json"
echo "2. Commit the file if the values look correct"
echo "3. Future CI runs will compare against these baseline values"
echo ""
echo "To build with performance tracking: IS_TESTING=true yarn build"