#!/bin/bash

# Performance Testing Script for Rainbow Browser Extension
# This script runs performance tests and generates a report

set -e

echo "🚀 Starting Performance Tests for Rainbow Extension"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if build exists
if [ ! -d "build" ]; then
    echo -e "${YELLOW}No build found. Building extension...${NC}"
    yarn build
fi

# Set environment variables for performance monitoring
export ENABLE_PERFORMANCE_MONITORING=true
export BROWSER=${BROWSER:-chrome}
export OS=${OS:-mac}

echo -e "\n${GREEN}Running performance tests on ${BROWSER}...${NC}"

# Run the performance test
yarn vitest run e2e/parallel/popupLoadPerformance.test.ts --reporter=verbose

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Performance tests passed!${NC}"
else
    echo -e "\n${RED}❌ Performance tests failed!${NC}"
    echo -e "${YELLOW}Check the console output above for details.${NC}"
    exit 1
fi

# Generate performance report
echo -e "\n${GREEN}Generating performance report...${NC}"

# Create reports directory if it doesn't exist
mkdir -p reports/performance

# Save the report with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="reports/performance/perf_report_${TIMESTAMP}.txt"

echo "Performance Test Report - $(date)" > "$REPORT_FILE"
echo "=================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Browser: ${BROWSER}" >> "$REPORT_FILE"
echo "OS: ${OS}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add test results to report
echo "Test Results:" >> "$REPORT_FILE"
echo "-------------" >> "$REPORT_FILE"
yarn vitest run e2e/parallel/popupLoadPerformance.test.ts --reporter=json 2>/dev/null | jq -r '.testResults[] | "\(.name): \(.status)"' >> "$REPORT_FILE" 2>/dev/null || echo "Unable to parse test results" >> "$REPORT_FILE"

echo -e "\n${GREEN}Report saved to: ${REPORT_FILE}${NC}"

# Display summary
echo -e "\n${GREEN}Performance Test Summary${NC}"
echo "========================"
echo -e "Report: ${REPORT_FILE}"
echo -e "Status: ${GREEN}Complete${NC}"

# Optional: Open report in default text editor
if command -v code &> /dev/null; then
    echo -e "\n${YELLOW}Opening report in VS Code...${NC}"
    code "$REPORT_FILE"
elif command -v open &> /dev/null; then
    echo -e "\n${YELLOW}Opening report...${NC}"
    open "$REPORT_FILE"
fi

echo -e "\n${GREEN}✨ Performance testing complete!${NC}" 