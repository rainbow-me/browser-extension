#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read browser config
const browserConfigPath = path.join(__dirname, '..', 'e2e', 'browsers.json');
const browserConfig = JSON.parse(fs.readFileSync(browserConfigPath, 'utf8'));

// Get browser and OS from environment
const browser = process.env.BROWSER || 'chrome';
const os = process.platform === 'darwin' ? 'mac' : 'linux';

function getBinaryPath() {
  const path = browserConfig[os][browser]['path'];
  if (!path) {
    throw new Error(`No binary path configured for ${browser} on ${os}`);
  }
  return path;
}

function getExpectedVersion() {
  const version = browserConfig[os][browser]['version'];
  if (!version) {
    throw new Error(`No expected version configured for ${browser}`);
  }
  return version;
}

function printInstallInstructions(browser, expectedVersion) {
  if (browser === 'chrome') {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📦 CHROME FOR TESTING INSTALLATION REQUIRED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('To fix this, run the setup script:');
    console.error('');
    console.error('  👉  ./scripts/setup-chrome.sh');
    console.error('');
    console.error(
      'This will download and install Chrome for Testing to /Applications',
    );
    console.error('');
    console.error('────────────────────────────────────────────────────────');
    console.error('Alternatively, you can install manually:');
    console.error(
      `  npx @puppeteer/browsers install chrome@${expectedVersion}`,
    );
    console.error('  Then move the app to /Applications/');
    console.error('');
    console.error('Or download Chrome for Testing directly:');
    console.error(`  https://googlechromelabs.github.io/chrome-for-testing/`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
  } else {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📦 FIREFOX DEVELOPER EDITION INSTALLATION REQUIRED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('To fix this, install the correct Firefox version:');
    console.error(
      `  👉  npx @puppeteer/browsers install firefox@devedition_${expectedVersion}`,
    );
    console.error('');
    console.error('Or download Firefox Developer Edition manually:');
    console.error(
      `  https://ftp.mozilla.org/pub/devedition/releases/${expectedVersion}/`,
    );
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
  }
}

function checkBrowserVersion() {
  const expectedVersion = getExpectedVersion();
  const binaryPath = getBinaryPath();

  try {
    const versionOutput = execSync(`"${binaryPath}" --version`, {
      encoding: 'utf8',
      stdio: 'pipe',
      shell: true,
    });

    const versionRegex =
      browser === 'chrome'
        ? /Chrome.*?([\d.]+)/
        : /Firefox ([\d.]+[a-zA-Z]\d*)/;

    const versionMatch = versionOutput.match(versionRegex);
    const actualVersion = versionMatch?.[1] || '';

    if (!actualVersion) {
      throw new Error(`Could not determine version for ${browser}`);
    }

    if (actualVersion !== expectedVersion) {
      console.error(`❌ Browser version mismatch for ${browser}!`);
      console.error(`Expected: ${expectedVersion}`);
      console.error(`Actual:   ${actualVersion}`);
      console.error('');

      printInstallInstructions(browser, expectedVersion, os);

      process.exit(1);
    }

    console.log(
      `✅ ${browser} version ${actualVersion} matches expected version ${expectedVersion}`,
    );
  } catch (error) {
    if (error.status === 1) {
      // Version mismatch error already handled above
      return;
    }

    console.error(
      `❌ Could not validate ${browser} version. Binary may not be installed.`,
    );
    console.error(`Expected path: ${binaryPath}`);
    console.error('');

    printInstallInstructions(browser, expectedVersion, os);

    console.error('');
    console.error(`Original error: ${error.message}`);
    process.exit(1);
  }
}

// Run the check
checkBrowserVersion();
