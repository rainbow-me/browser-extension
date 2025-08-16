# How to Enable Rainbow POC Extension in Safari

## Step-by-Step Instructions

### 1. Allow Unsigned Extensions (Required for Development)
**Important**: Safari requires this step every day for unsigned extensions.

1. Open Safari
2. In the menu bar, click **Safari → Settings** (or press `⌘,`)
3. Click the **Advanced** tab
4. Check the box: **"Show features for web developers"**
5. Close Settings
6. In the menu bar, you should now see a **Develop** menu
7. Click **Develop → Allow Unsigned Extensions**
8. Enter your macOS password when prompted

### 2. Open the Rainbow POC App
The app should already be open. If not:
```bash
open "/Users/daniel/Library/Developer/Xcode/DerivedData/Rainbow_POC-bbbjkxypawygyhgxgvibsqmnybfa/Build/Products/Debug/Rainbow POC.app"
```

You should see a window with:
- Rainbow POC title
- Text explaining it's a Safari extension
- A button saying "Quit Rainbow POC" or "Open Safari Extensions Preferences"

### 3. Enable the Extension in Safari

**Method A: From the App**
1. In the Rainbow POC app window, click **"Open Safari Extensions Preferences"**
2. Safari Settings will open to the Extensions tab

**Method B: Manual**
1. Open Safari
2. Go to **Safari → Settings** (⌘,)
3. Click the **Extensions** tab

### 4. Turn On the Extension
In the Extensions tab:
1. Look for **"Rainbow POC Extension"** in the left sidebar
2. Click on it to select it
3. Check the box next to **"Rainbow POC Extension"** to enable it
4. You should see details on the right:
   - "This extension can read and alter webpages"
   - Permissions list

### 5. Configure Extension Permissions (if needed)
1. While the extension is selected, you can configure:
   - **Allow on these websites**: Set to "All websites" or specific sites
   - **Allow in Private Browsing**: Check if you want it in private windows

### 6. Verify the Extension is Working
1. Look at Safari's toolbar (to the right of the address bar)
2. You should see the Rainbow extension icon (may look like a puzzle piece or the app icon)
3. Click the icon to open the extension popup
4. The popup should display (may show loading or require refresh)

## Troubleshooting

### Extension Not Showing in Safari
1. Make sure you allowed unsigned extensions (Step 1)
2. Verify the app is running: Check if Rainbow POC app window is open
3. Try quitting and reopening the Rainbow POC app
4. Restart Safari

### Extension Icon Not in Toolbar
1. Right-click on Safari's toolbar
2. Select **"Customize Toolbar..."**
3. Drag the Rainbow POC extension icon to the toolbar
4. Click **Done**

### Extension Not Working
1. Open Safari's Web Inspector:
   - **Develop → Web Extension Background Content → Rainbow POC**
2. Check for any error messages in the console
3. Try reloading the extension:
   - Uncheck and recheck the extension in Safari Settings

### "Unable to Use Extension" Error
This usually means you need to allow unsigned extensions again:
1. **Develop → Allow Unsigned Extensions**
2. Restart the Rainbow POC app
3. Re-enable in Safari Settings

## Quick Command to Open Everything
```bash
# Run this to open both the app and Safari settings
open "/Users/daniel/Library/Developer/Xcode/DerivedData/Rainbow_POC-bbbjkxypawygyhgxgvibsqmnybfa/Build/Products/Debug/Rainbow POC.app"
sleep 2
osascript -e 'tell application "Safari" to activate'
osascript -e 'tell application "System Events" to keystroke "," using command down'
```

## Important Notes
- **Daily Requirement**: You must allow unsigned extensions every day in Safari
- **Code Signing**: For production, you'll need an Apple Developer account to sign the extension
- **Debugging**: Use Safari's Web Inspector (Develop menu) to debug the extension
- **Permissions**: The extension needs permission to access websites to inject the wallet provider

## Current Status
✅ App is built and running
✅ Extension is bundled correctly
⏳ Waiting to be enabled in Safari Settings

Follow the steps above to enable the extension in Safari!