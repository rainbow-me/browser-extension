#!/bin/bash

# Setup Chrome 138 for testing
# This script downloads Chrome 138 for testing binary and installs it to /Applications

set -e

CHROME_VERSION="138.0.7204.183"
TEMP_DIR="/tmp/chrome-testing-download"
APP_NAME="Google Chrome for Testing.app"
INSTALL_PATH="/Applications/$APP_NAME"

echo "🚀 Setting up Chrome ${CHROME_VERSION} for testing..."

# Check if Chrome for Testing is already installed with correct version
if [ -d "$INSTALL_PATH" ]; then
  # Try to get the version of installed Chrome
  if [ -f "$INSTALL_PATH/Contents/MacOS/Google Chrome for Testing" ]; then
    INSTALLED_VERSION=$("$INSTALL_PATH/Contents/MacOS/Google Chrome for Testing" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
    if [ "$INSTALLED_VERSION" = "$CHROME_VERSION" ]; then
      echo "✅ Chrome for Testing ${CHROME_VERSION} is already installed in /Applications"
      exit 0
    else
      echo "⚠️  Found Chrome for Testing version $INSTALLED_VERSION, but need $CHROME_VERSION"
      echo "📦 Will download and install the correct version..."
    fi
  fi
fi

# Create temp directory for download
echo "📦 Downloading Chrome for Testing ${CHROME_VERSION}..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Download Chrome using puppeteer/browsers to temp directory
npx @puppeteer/browsers install chrome@${CHROME_VERSION} --path "$TEMP_DIR"

# Find the downloaded app
DOWNLOADED_APP=$(find "$TEMP_DIR" -name "$APP_NAME" -type d | head -1)

if [ -z "$DOWNLOADED_APP" ]; then
  echo "❌ Error: Could not find downloaded Chrome for Testing app"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Move to Applications (requires sudo)
echo "📍 Installing Chrome for Testing to /Applications..."
echo "   Note: This requires administrator privileges"

# Remove old version if exists
if [ -d "$INSTALL_PATH" ]; then
  echo "   Removing old version..."
  sudo rm -rf "$INSTALL_PATH"
fi

# Copy new version to Applications
sudo cp -R "$DOWNLOADED_APP" "/Applications/"

# Verify installation
if [ -f "$INSTALL_PATH/Contents/MacOS/Google Chrome for Testing" ]; then
  FINAL_VERSION=$("$INSTALL_PATH/Contents/MacOS/Google Chrome for Testing" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
  if [ "$FINAL_VERSION" = "$CHROME_VERSION" ]; then
    echo "✅ Chrome for Testing ${CHROME_VERSION} installed successfully!"
    echo "📍 Location: $INSTALL_PATH"
  else
    echo "⚠️  Installation completed but version verification failed"
    echo "   Expected: $CHROME_VERSION"
    echo "   Got: $FINAL_VERSION"
  fi
else
  echo "❌ Error: Installation failed - Chrome binary not found at expected location"
  exit 1
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Setup complete! Chrome for Testing is ready for E2E tests."