#!/bin/bash

# Setup Chrome 138 for testing
# This script downloads Chrome 138 for testing binary and sets it up for use in tests

set -e

CHROME_VERSION="138.0.7204.183"
CHROME_DIR="chrome-138"

echo "🚀 Setting up Chrome 138 for testing..."

# Check if Chrome 138 is already downloaded
if [ -d "$CHROME_DIR" ] && [ -f "$CHROME_DIR/.version" ]; then
  INSTALLED_VERSION=$(cat "$CHROME_DIR/.version")
  if [ "$INSTALLED_VERSION" = "$CHROME_VERSION" ]; then
    echo "✅ Chrome 138 already installed (version: $INSTALLED_VERSION)"
    echo "📍 Chrome binary location: $(pwd)/$CHROME_DIR"
    exit 0
  fi
fi

echo "📦 Downloading Chrome 138..."

# Use puppeteer/browsers to download Chrome 138
npx @puppeteer/browsers install chrome@138 --path "$CHROME_DIR"

# Save version info
echo "$CHROME_VERSION" > "$CHROME_DIR/.version"

# Find the Chrome binary
CHROME_BIN=$(find "$CHROME_DIR" -type f -name "Google Chrome for Testing" | head -1)

if [ -z "$CHROME_BIN" ]; then
  echo "❌ Error: Could not find Chrome binary"
  exit 1
fi

echo "✅ Chrome 138 installed successfully"
echo "📍 Chrome binary: $CHROME_BIN"