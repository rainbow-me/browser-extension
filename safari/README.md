# Rainbow Safari Extension

This directory contains the Safari Web Extension version of Rainbow Wallet.

## 🚀 Quick Start

```bash
# Build and run Safari extension
yarn safari:run

# Or step by step:
yarn safari:build     # Build extension and prepare manifest
yarn safari:convert   # Convert to Safari Web Extension
yarn safari:xcode     # Build with Xcode
```

## 📁 Directory Structure

```
safari/
├── Rainbow/                    # Xcode project (generated)
│   ├── Rainbow.xcodeproj/     # Xcode project file
│   ├── macOS (App)/           # macOS app wrapper
│   ├── macOS (Extension)/     # Safari extension
│   └── Shared (Extension)/    # Extension resources
├── Safari.MD                   # Detailed migration guide
├── SAFARI_ENABLE_GUIDE.md     # How to enable in Safari
└── SAFARI_MIGRATION_LOG.md    # Migration history

```

## 🛠️ Development

### Prerequisites
- macOS with Xcode installed
- Safari with Developer mode enabled
- Node.js 22.17.0+

### Building
1. Build the extension: `yarn safari:build`
2. Convert to Safari: `yarn safari:convert`
3. Build with Xcode: `yarn safari:xcode`
4. Open the app: `yarn safari:run`

### Enabling in Safari
1. Open Safari → Settings → Advanced
2. Check "Show features for web developers"
3. In menu bar: Develop → Allow Unsigned Extensions
4. Safari → Settings → Extensions
5. Enable "Rainbow Extension"

## 🧪 Testing

The extension automatically includes polyfills for Chrome APIs that aren't available in Safari. Key compatibility features:

- ✅ Storage APIs (local and session)
- ✅ Runtime messaging
- ✅ Tabs and windows APIs
- ✅ Content scripts
- ✅ Service workers
- ⚠️ Notifications (polyfilled with no-op)
- ❌ WebHID/WebUSB (hardware wallets not supported)

## 📝 Known Limitations

1. **Hardware Wallets**: WebHID/WebUSB APIs not available in Safari
   - Solution: Implement QR code or WalletConnect fallback

2. **Notifications**: Limited support, polyfilled to prevent errors

3. **Daily Signing**: Unsigned extensions must be re-enabled daily
   - Solution: Get Apple Developer account for production

## 🚢 Production Deployment

1. Join Apple Developer Program ($99/year)
2. Code sign the extension
3. Submit to Mac App Store
4. Or distribute directly with Developer ID

## 📚 Resources

- [Safari Web Extensions Documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Converting Web Extensions for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [WebExtension Polyfill](https://github.com/mozilla/webextension-polyfill)

## 🤝 Support

For Safari-specific issues, check:
- Safari → Develop → Web Extension Background Content → Rainbow
- Console for any errors
- [GitHub Issues](https://github.com/rainbow-me/browser-extension/issues)