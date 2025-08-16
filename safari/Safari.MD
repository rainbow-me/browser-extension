# Safari Web Extension Migration Guide

## Executive Summary

Rainbow Wallet is a Manifest V3 browser extension currently supporting Chrome and Firefox. This document outlines the current state of Safari Web Extension support and provides a comprehensive migration plan to add Safari compatibility.

**Key Finding**: Safari support is achievable with ~85% feature parity. The main blocker is hardware wallet support (WebHID/WebUSB APIs).

## Current Extension State

### Architecture Overview
- **Manifest Version**: V3 (Safari compatible since 15.4)
- **Background**: Service Worker model
- **Storage**: Local storage + Session storage
- **UI Framework**: React with TypeScript
- **Build System**: Custom build pipeline
- **Hardware Wallets**: Ledger/Trezor via WebHID

### Chrome-Specific Dependencies
The codebase contains 25+ files using `chrome.*` namespace APIs:
- `chrome.storage.*` (local, session, onChanged)
- `chrome.runtime.*` (messaging, getURL, onInstalled)
- `chrome.tabs.*` (create, sendMessage, query)
- `chrome.windows.*` (create, update, remove)
- `chrome.scripting.*` (registerContentScripts)
- `chrome.notifications.*`
- `chrome.commands.*`
- `chrome.action.*`
- `chrome.extension.getViews()` (deprecated)

## Safari Web Extension Support Status

### Supported Features (✅)

#### Core APIs (Safari 15.4+)
- Manifest V3 support
- Service Workers for background scripts
- Content scripts with all_frames support
- `browser.storage.local` API
- `browser.storage.session` API (Safari 16.4+)
- Web accessible resources
- Extension messaging (`runtime.sendMessage`)
- Tab management (`tabs.*` API)
- Window management (`windows.*` API)
- Scripting API (`scripting.*`)
- Notifications API
- Commands API (keyboard shortcuts)
- Permissions API

#### Storage Session Support (Safari 16.4+)
- Full `browser.storage.session` API
- 10MB quota (same as Chrome)
- Memory-only persistence
- `onChanged` event listeners
- `setAccessLevel()` for content script access (Safari 17.1+)

### Unsupported Features (❌)

#### Critical Blockers
1. **WebHID/WebUSB APIs**
   - No hardware wallet support (Ledger, Trezor)
   - No alternative APIs available
   - Affects: `src/entries/popup/handlers/ledger.ts`, `src/entries/popup/handlers/wallet.ts`

2. **Deprecated APIs**
   - `chrome.extension.getViews()` - used in `src/entries/popup/pages/walletReady/ReadyShortcut.tsx`

#### Minor Differences
- Some `chrome.action.getUserSettings()` properties may differ
- CSP handling differences
- Extension ID format differences

## Migration Plan: Full Implementation

### Phase 1: Environment Setup (Week 1)

#### 1.1 Development Environment
```bash
# Install Xcode (required for Safari extension development)
# Download from Mac App Store or developer.apple.com

# Enable Safari Developer Mode
# Safari → Preferences → Advanced → Show Develop menu

# Enable Unsigned Extensions
# Develop → Allow Unsigned Extensions (daily toggle required)
```

#### 1.2 Dependencies Installation
```bash
# Install webextension-polyfill for browser API compatibility
yarn add webextension-polyfill
yarn add -D @types/webextension-polyfill

# Install Safari build tools
yarn add -D safari-web-extension-converter
```

#### 1.3 Project Structure Setup
```bash
# Create Safari-specific directories
mkdir -p src/safari
mkdir -p build/safari
mkdir -p static/safari
```

### Phase 2: Code Migration (Week 2-3)

#### 2.1 Create Browser Compatibility Layer
```typescript
// src/core/utils/browser-compat.ts
import browser from 'webextension-polyfill';

// Detect Safari
export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const isChrome = /chrome/i.test(navigator.userAgent);
export const isFirefox = /firefox/i.test(navigator.userAgent);

// Export unified browser API
export { browser };

// Compatibility helpers
export const getBrowserName = () => {
  if (isSafari) return 'safari';
  if (isFirefox) return 'firefox';
  return 'chrome';
};

// Handle deprecated APIs
export const getExtensionViews = (fetchProperties?: { type?: string }) => {
  if (browser.extension?.getViews) {
    return browser.extension.getViews(fetchProperties);
  }
  // Safari fallback - use runtime messaging to detect popup
  return [];
};
```

#### 2.2 Global API Migration Script
```javascript
// scripts/migrate-to-browser-api.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const migrateFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace chrome with browser
  content = content.replace(/chrome\./g, 'browser.');
  
  // Update imports
  if (content.includes('browser.')) {
    const importStatement = "import { browser } from '~/core/utils/browser-compat';\n";
    if (!content.includes(importStatement)) {
      content = importStatement + content;
    }
  }
  
  // Update TypeScript types
  content = content.replace(/chrome\.storage\.StorageChange/g, 'browser.storage.StorageChange');
  content = content.replace(/chrome\.runtime\.MessageSender/g, 'browser.runtime.MessageSender');
  content = content.replace(/chrome\.tabs\.Tab/g, 'browser.tabs.Tab');
  content = content.replace(/chrome\.windows\.Window/g, 'browser.windows.Window');
  
  fs.writeFileSync(filePath, content);
};

// Run migration
glob.sync('src/**/*.{ts,tsx,js,jsx}').forEach(migrateFile);
```

#### 2.3 Storage Layer Updates
```typescript
// src/core/storage/index.ts
import { browser, isSafari } from '~/core/utils/browser-compat';
import { RainbowError, logger } from '~/logger';

// Initialize session storage access for Safari
export const initializeStorage = async () => {
  if (isSafari && browser.storage.session?.setAccessLevel) {
    try {
      await browser.storage.session.setAccessLevel(
        'TRUSTED_AND_UNTRUSTED_CONTEXTS'
      );
      logger.info('Safari session storage access granted to content scripts');
    } catch (error) {
      logger.error(new RainbowError('Failed to set Safari storage access level'), {
        error: error.message
      });
    }
  }
};

export const LocalStorage = {
  async clear() {
    await browser.storage.local.clear();
  },
  async set<TValue = unknown>(key: string, value: TValue) {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (e) {
      logger.error(new RainbowError('LocalStorage write error'), {
        message: e instanceof Error ? e.message : `Unknown error: ${JSON.stringify(e)}`,
      });
    }
  },
  async get<TValue = unknown>(key: string) {
    const result = await browser.storage.local.get(key);
    return result[key] as TValue;
  },
  async remove(key: string) {
    await browser.storage.local.remove(key);
  },
  async listen<TValue = unknown>(
    key: string,
    callback: (newValue: TValue, oldValue: TValue) => void,
  ) {
    const listener = (changes: Record<string, browser.storage.StorageChange>) => {
      if (!changes[key] || changes[key]?.newValue === changes[key]?.oldValue)
        return;
      callback(changes[key]?.newValue, changes[key]?.oldValue);
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  },
};

export const SessionStorage = {
  async clear() {
    if (!browser.storage.session) {
      logger.warn('Session storage not available');
      return;
    }
    await browser.storage.session.clear();
  },
  async set(key: string, value: unknown) {
    if (!browser.storage.session) {
      // Fallback to local storage with session prefix
      return LocalStorage.set(`_session_${key}`, value);
    }
    try {
      await browser.storage.session.set({ [key]: value });
    } catch (e) {
      const errorMessage = e?.message || '';
      if (errorMessage.includes('quota')) {
        // Log quota issues
        const queuedEvents = await SessionStorage.get('queuedEvents');
        const rateLimits = await SessionStorage.get('rateLimits');
        logger.info('SessionStorage quota exceeded', {
          queuedEventsSize: queuedEvents?.length || 0,
          rateLimitsSize: Object.keys(rateLimits || {}).length
        });
      }
      logger.error(new RainbowError('SessionStorage write error'), {
        message: errorMessage,
      });
    }
  },
  async get(key: string) {
    if (!browser.storage.session) {
      return LocalStorage.get(`_session_${key}`);
    }
    const result = await browser.storage.session.get(key);
    return result[key];
  },
  async remove(key: string) {
    if (!browser.storage.session) {
      return LocalStorage.remove(`_session_${key}`);
    }
    await browser.storage.session.remove(key);
  },
  async listen<TValue = unknown>(
    key: string,
    callback: (newValue: TValue, oldValue: TValue) => void,
  ) {
    if (!browser.storage.session) {
      return LocalStorage.listen(`_session_${key}`, callback);
    }
    const listener = (changes: Record<string, browser.storage.StorageChange>) => {
      if (!changes[key] || changes[key]?.newValue === changes[key]?.oldValue)
        return;
      callback(changes[key]?.newValue, changes[key]?.oldValue);
    };
    browser.storage.session.onChanged.addListener(listener);
    return () => browser.storage.session.onChanged.removeListener(listener);
  },
};
```

#### 2.4 Hardware Wallet Abstraction
```typescript
// src/core/hardware-wallet/index.ts
import { isSafari } from '~/core/utils/browser-compat';

export interface HardwareWalletProvider {
  isSupported(): boolean;
  connect(): Promise<void>;
  signTransaction(tx: any): Promise<string>;
  signMessage(message: string): Promise<string>;
  getAddress(path: string): Promise<string>;
}

// WebHID implementation for Chrome/Firefox
class WebHIDWalletProvider implements HardwareWalletProvider {
  isSupported() {
    return 'hid' in navigator;
  }
  // ... existing WebHID implementation
}

// QR Code implementation for Safari
class QRCodeWalletProvider implements HardwareWalletProvider {
  isSupported() {
    return isSafari;
  }
  
  async connect() {
    // Show QR code UI for mobile wallet connection
    throw new Error('QR Code wallet connection UI not yet implemented');
  }
  
  async signTransaction(tx: any) {
    // Generate QR code for transaction signing
    throw new Error('QR Code signing not yet implemented');
  }
  
  async signMessage(message: string) {
    // Generate QR code for message signing
    throw new Error('QR Code message signing not yet implemented');
  }
  
  async getAddress(path: string) {
    // Show QR code to get address from mobile wallet
    throw new Error('QR Code address retrieval not yet implemented');
  }
}

// Factory function
export const getHardwareWalletProvider = (): HardwareWalletProvider => {
  if (isSafari) {
    return new QRCodeWalletProvider();
  }
  return new WebHIDWalletProvider();
};

// Update Ledger handler
// src/entries/popup/handlers/ledger.ts
import { getHardwareWalletProvider, isSafari } from '~/core/utils/browser-compat';

export async function signTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<string> {
  const provider = getHardwareWalletProvider();
  
  if (!provider.isSupported()) {
    throw new Error(
      isSafari 
        ? 'Hardware wallets are not directly supported in Safari. Please use QR code signing.'
        : 'Hardware wallet support not available'
    );
  }
  
  return provider.signTransaction(transaction);
}
```

### Phase 3: Safari-Specific Adjustments (Week 4)

#### 3.1 Create Safari Manifest
```json
// static/safari/manifest.json
{
  "manifest_version": 3,
  "name": "Rainbow Wallet",
  "version": "1.5.132",
  "description": "Ethereum wallet for Safari",
  
  "background": {
    "service_worker": "background.js",
    "persistent": false
  },
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon-16.png",
      "32": "images/icon-16@2x.png",
      "64": "images/icon-16@4x.png",
      "128": "images/icon-16@8x.png"
    }
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentscript.js"],
      "run_at": "document_start",
      "all_frames": true
    }
  ],
  
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "scripting",
    "notifications",
    "clipboardWrite"
  ],
  
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  
  "web_accessible_resources": [
    {
      "resources": ["inpage.js", "*.woff2", "popup.css", "assets/badges/*.png"],
      "matches": ["<all_urls>"]
    }
  ],
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  },
  
  "browser_specific_settings": {
    "safari": {
      "strict_min_version": "16.4"
    }
  }
}
```

#### 3.2 Build Configuration
```javascript
// webpack.safari.config.js
const baseConfig = require('./webpack.config.js');

module.exports = {
  ...baseConfig,
  
  output: {
    ...baseConfig.output,
    path: path.resolve(__dirname, 'build/safari'),
  },
  
  plugins: [
    ...baseConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.TARGET_BROWSER': JSON.stringify('safari'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static/safari/manifest.json', to: 'manifest.json' },
      ],
    }),
  ],
  
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve.alias,
      'webextension-polyfill': require.resolve('webextension-polyfill'),
    },
  },
};
```

#### 3.3 Safari Build Script
```json
// package.json
{
  "scripts": {
    "build:safari": "webpack --config webpack.safari.config.js",
    "convert:safari": "xcrun safari-web-extension-converter build/safari --project-location safari-extension --app-name RainbowWallet",
    "safari": "yarn build:safari && yarn convert:safari",
    "safari:dev": "yarn build:safari --watch"
  }
}
```

### Phase 4: Testing & Debugging (Week 5)

#### 4.1 Safari-Specific Test Suite
```typescript
// e2e/safari/hardware-wallet.test.ts
import { test, expect } from '@playwright/test';
import { isSafari } from '~/core/utils/browser-compat';

test.describe('Safari Hardware Wallet Fallback', () => {
  test.skip(!isSafari, 'Safari-only test');
  
  test('should show QR code option for hardware wallet', async ({ page }) => {
    await page.goto('chrome-extension://[id]/popup.html');
    await page.click('[data-testid="add-wallet"]');
    await page.click('[data-testid="hardware-wallet"]');
    
    // Should show Safari-specific message
    await expect(page.locator('[data-testid="safari-hw-message"]')).toContainText(
      'Hardware wallets require QR code signing on Safari'
    );
    
    // Should show QR code option
    await expect(page.locator('[data-testid="qr-code-connect"]')).toBeVisible();
  });
});
```

#### 4.2 Cross-Browser Test Matrix
```yaml
# .github/workflows/test-safari.yml
name: Safari Extension Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Build Safari extension
        run: yarn build:safari
      
      - name: Convert to Safari extension
        run: yarn convert:safari
      
      - name: Run Safari tests
        run: |
          # Enable Safari automation
          safaridriver --enable
          # Run Playwright tests
          yarn test:e2e:safari
```

### Phase 5: Deployment (Week 6)

#### 5.1 App Store Preparation
```swift
// safari-extension/RainbowWallet/ViewController.swift
import Cocoa
import SafariServices

class ViewController: NSViewController {
    @IBOutlet var appNameLabel: NSTextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.appNameLabel.stringValue = "Rainbow Wallet"
    }
    
    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.rainbow.wallet.extension") { error in
            if let error = error {
                print("Error opening Safari Extension Preferences: \(error)")
            }
        }
    }
}
```

#### 5.2 Entitlements Configuration
```xml
<!-- safari-extension/RainbowWallet/RainbowWallet.entitlements -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-only</key>
    <true/>
</dict>
</plist>
```

## Prototype Plan: Quick Safari POC

### Step 1: Basic Conversion (1 hour)

```bash
# Clone and prepare
git clone [repository]
cd browser-extension

# Install dependencies
yarn install

# Build current extension
yarn build

# Install Safari converter
npm install -g safari-web-extension-converter

# Run converter
xcrun safari-web-extension-converter build \
  --project-location ./rainbow-safari \
  --app-name "Rainbow Wallet POC" \
  --bundle-identifier "com.rainbow.wallet.poc"
```

### Step 2: Manual Polyfill Integration (30 minutes)

```bash
# Install polyfill
yarn add webextension-polyfill

# Create compatibility shim
cat > src/safari-shim.js << 'EOF'
import browser from 'webextension-polyfill';
window.browser = browser;
window.chrome = browser;
EOF

# Add to webpack entry points
# webpack.config.js
entry: {
  'safari-shim': './src/safari-shim.js',
  // ... other entries
}
```

### Step 3: Quick Manifest Fixes (30 minutes)

```javascript
// scripts/prepare-safari-manifest.js
const fs = require('fs');
const manifest = require('../build/manifest.json');

// Remove Chrome-specific fields
delete manifest.minimum_chrome_version;
delete manifest.key;
delete manifest.update_url;

// Update for Safari
manifest.browser_specific_settings = {
  safari: {
    strict_min_version: "16.4"
  }
};

// Remove unsupported permissions
manifest.permissions = manifest.permissions.filter(p => 
  !['unlimitedStorage'].includes(p)
);

fs.writeFileSync('build/safari-manifest.json', JSON.stringify(manifest, null, 2));
```

### Step 4: Build & Load POC (30 minutes)

```bash
# Run preparation script
node scripts/prepare-safari-manifest.js

# Copy manifest
cp build/safari-manifest.json build/manifest.json

# Convert to Safari extension
xcrun safari-web-extension-converter build \
  --project-location ./rainbow-safari-poc \
  --app-name "Rainbow POC"

# Open Xcode project
open rainbow-safari-poc/Rainbow\ POC/Rainbow\ POC.xcodeproj

# In Xcode:
# 1. Select "Rainbow POC" target
# 2. Build and Run (⌘R)
# 3. Enable extension in Safari Preferences
```

### Step 5: Test Core Functionality

```javascript
// Quick test script - test-safari.js
const tests = [
  {
    name: 'Storage API',
    test: async () => {
      await browser.storage.local.set({ test: 'value' });
      const result = await browser.storage.local.get('test');
      return result.test === 'value';
    }
  },
  {
    name: 'Session Storage',
    test: async () => {
      if (!browser.storage.session) return false;
      await browser.storage.session.set({ session: 'test' });
      const result = await browser.storage.session.get('session');
      return result.session === 'test';
    }
  },
  {
    name: 'Runtime messaging',
    test: async () => {
      return typeof browser.runtime.sendMessage === 'function';
    }
  },
  {
    name: 'Tabs API',
    test: async () => {
      const tabs = await browser.tabs.query({ active: true });
      return Array.isArray(tabs);
    }
  }
];

// Run tests
for (const { name, test } of tests) {
  try {
    const result = await test();
    console.log(`✅ ${name}: ${result ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
  }
}
```

## Expected Outcomes

### Working Features (85% parity)
- ✅ Wallet creation and import
- ✅ Account management
- ✅ Token balances and transactions
- ✅ DApp connections
- ✅ Transaction signing
- ✅ NFT viewing
- ✅ Network switching
- ✅ Settings and preferences

### Limited/Alternative Features
- ⚠️ Hardware wallets → QR code signing
- ⚠️ Some extension APIs → Polyfilled alternatives

### Non-Functional Features
- ❌ Direct USB hardware wallet support
- ❌ WebHID/WebUSB dependent features

## Timeline Summary

### Full Implementation (6 weeks)
- Week 1: Environment setup
- Week 2-3: Code migration
- Week 4: Safari adjustments
- Week 5: Testing
- Week 6: Deployment prep

### Quick POC (3 hours)
- Hour 1: Basic conversion
- Hour 2: Polyfill integration
- Hour 3: Testing core features

## Success Metrics

1. **Core Functionality**: 85% feature parity with Chrome version
2. **Performance**: <10% slower than Chrome extension
3. **User Experience**: Clear messaging for unsupported features
4. **Store Compliance**: Passes App Store review
5. **Crash Rate**: <1% in production

## Maintenance Considerations

1. **Dual Build Pipeline**: Maintain separate builds for Chrome/Firefox and Safari
2. **API Monitoring**: Track Safari WebExtension API updates
3. **Polyfill Updates**: Keep webextension-polyfill current
4. **Testing**: Add Safari to CI/CD pipeline
5. **Documentation**: Maintain Safari-specific user docs

## Resources

- [Safari Web Extensions Documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [WebExtension Polyfill](https://github.com/mozilla/webextension-polyfill)
- [Safari Extension Converter](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [WWDC Safari Extensions Sessions](https://developer.apple.com/videos/safari-and-web)
- [WebKit Blog](https://webkit.org/blog/)

## Conclusion

Safari support is achievable with most features working through the webextension-polyfill. The main challenge is hardware wallet support, which requires implementing alternative solutions like QR code signing. The quick POC approach can validate basic functionality in 3 hours, while full implementation would take approximately 6 weeks including testing and App Store preparation.