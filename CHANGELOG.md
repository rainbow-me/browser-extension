# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

### Security

## [v1.1.0](https://github.com/rainbow-me/rainbow/releases/tag/v1.1.0)

### Added

- `R` hotkey to refresh Tokens & Activity

### Changed

- Faster wallet discovery on Secret Recovery Phrase import
- Allowing users to import a wallet without on-chain activity in the Secret Recovery Phrase import flow
- Replaced “Recovery Phrase n” with “Wallet Group n” in the Wallets & Keys flows in Settings
- Improved Hardware Wallet USB connection reliability issues
- “Pin Rainbow to your toolbar” nudge is now available on the Welcome screen
- Improved drag-and-drop wallet list reliability in the Wallet Switcher
- Introduced a “Unknown Token” fallback name for new or unindexed tokens
- Adjusted Ledger flow Unlock copy
- Updated copy in Secret Recovery Phrase Import to clarify that users can paste their seed phrase
- Replaced “Swapping via” and “Bridging via” for Bridges
- Increased Send warning checkbox click area
- Deprecated “injection complete in window” console log on dApps

### Fixed

- Fixed overlapping cells in Tokens and Activity
- Fixed an issue that caused certain ENS Profile avatars to incorrectly resolve
- Fixed backward navigation order issues
- Fixed an issue that sometimes caused wallet creation in Onboarding to fail
- Fixed gas estimates that caused “Insufficient ETH” error when using the Max feature in Swaps
- Removed Send and Swap items from the right-click menu on Token cells for Watched wallets
- Fixed Bridge failures for a subset of tokens
- Fixed issue where tokens appear in the wrong wallet when switching wallets quickly with hotkeys
- Fixed layout issues in Send inputs
- Fixed ratio distortion on non-square avatars
- Preventing infinite loop after using Wallet Switcher shortcuts
- Disabled autocomplete dropdown on input fields
- Activity header height fix
- Fixed an issue with certain interfaces that require custom tabIndex values
- Fixed issue where Custom Gas label shows when not using Custom Gas in Swap flow
- Improved scroll behavior after switching Tokens and Activity tabs
- Disabled `f` and `m` hotkeys when searching tokens in Swap and Send
- Improved transition smoothness on Welcome screen shortcut preview
- Fixed an issue that caused the Shortcut preview on the Welcome screen to highlight when unfocusing the window
- Fixed an issue where the `f` flip shortcut in Swap would clear asset amount input fields
- Fixed hover highlight animation on “Create a new wallet” button in Onboarding
- Removed “Last tx” label for wallets without activity during import flows
- Fixed color contrast for certain assets in dark mode
- Resolved an issue with the Rename Wallet prompt where input field was not always cleared
- Hiding currently selected wallet from the wallet list in Send
- Fixed UI display issue for wrapped tokens in Swaps
- Fixed an issue where you could select the same native token in the Swap pair selection
- Fixed a quiet failure after attempting to import the Secret Recovery Phrase or Private Key for a watched wallet
- Fixed an issue where UI broke during Swaps when no token pricing data was available
- Fixed incorrect order of Approve and Swap transactions in the Activity list for Swaps
- Fixed a scenario where the Secret Recovery Phrase input UI was clipped

### Security

- Import flow redesign to mitigate known Demonic vulnerability reported by Halborn

## v1.0.170

### Added

- Default Provider setting is now on by default
- Notifications Permission request in anticipation of upcoming features

### Changed

- Wallet Selection menus are now scrollable
- Changed Gwei Settings title to Gas Settings
- Better “Connect your wallets” copy during the Hardware Wallet import step
- Better “Connected successfully” copy during the Hardware Wallet connect flow
- Improved handling for full screen flows
- Text color consistency between Ledger and Trezor Hardware Wallet flows
- Improved copy on discovered wallet list for Secret Recovery Phrase imports
- Added `Share Feedback` and `Guides & Support` links to the More menu
- Added `Share Beta Feedback` and `Guides & Support` like to Settings
- Deprecating placeholder Contacts menu item in Settings

### Fixed

- Fixed issue where a user could broadcast multiple transactions when spamming confirmation button in the Send or Swap flow
- Fixed scenario where user could get stuck with only the “Skip” button at the Verify Seed Phrase step of Onboarding
- Fixed mainnet Send and Swap transactions for Ledger and Trezor Hardware Wallets
- Fixed missing Trezor icon in Wallets & Keys Settings
- Excluding Hardware Wallets from Wallet Groups list
- Fixed Welcome screen `Alt+Shift+R` reliability
- Fixed “Watching” mode alert when attempting to Sign messages or transactions with a watched wallet
- Fixed backward navigation flows in Wallets & Keys submenus in Settings
- Fixed light mode switch network menu accent colors
- Fixed Swap Review sheet height
- Prompts now have a max width and look better in Hardware Wallet flows
- Fixes for fullscreen flows to better support Hardware Wallet flows
- Fixed Wallet Group list cell separator alignment

## v1.0.160

### Added

- Choose a Wallet Group (aka Secret Recovery Phrase) when creating a new wallet
- Redesigned Welcome screen that features the `Alt+Shift+R` shortcut
- “Connect your Ledger” UI for Ledger Hardware Wallets
- “Connected successfully” UI for Ledger Hardware Wallets

### Changed

- You can now tab through options in the Onboarding import flow and the Wallet Switcher “Add another wallet” menu
- Improved Ledger “Connect your wallets” selection cells for wallets without discoverable balances
- Improved animation when watching a new wallet from the Wallet Switcher
- Improved wallet ordering defaults in Send address dropdown
- Improved “Add a wallet by its index” screen presentation transition for Hardware Wallets

### Fixed

- Fixed an issue with the `,` shortcut for Settings
- Fixed an issue where Bridging in the Swap flow would lead to a blank screen
- Fixed an issue where right-clicked tokens were not unset upon entering the Swap or Send flow from the Swap and Send buttons
- Fixed an issue where pressing `Enter` during the Onboarding “Watch Wallet” flow caused the empty input to be accepted
- Fixed an issue where pressing `Enter` twice during the Onboarding “Import Wallet” flow caused the empty input to be accepted
- Resolved incorrect swap values for `BNB` token and other native asset swap pairs
- Resolved display issues on the custom gas input fields when large numbers are entered
- Fixed edge cases in the Swap flow where USD estimates for certain assets appeared as $Nan
- Fixed an issue where the Onboarding “Watch wallet” button was not clickable after deselecting and reselecting an ENS
- Fixed Swaps inside the fullscreen flow for Hardware Wallet signatures

## v1.0.151

### Added

- Onboarding UI fixes and consistency improvements
- Swap Quotes now have more accurate fee-adjusted display values

### Fixed

- Fixed scrolling in Wallet Switcher when Tips are dismissed
- Fixed Send token selection clash for assets that use the same address across multiple networks
- Fixed allowance issues for cross-chain swaps that caused some swaps to fail
- Fixed input-output USD difference Swap quote estimation subline
- Fixed Wallet Switcher accent colors
- Blocking navigation during Onboarding to resolve scenarios where a user could create multiple seed phrases simultaneously
- Clearing keychain on Welcome screen when no password is set
- Fixed out-of-bounds toast component edge cases
- Fixed Swap token Copy action inadvertent select behavior
- Preventing token-selection clicks in Swaps once token pairs are selected to streamline token amount editing
- Fixed Small Market Warning text overflow in Swap Review

## v1.0.145

### Added

- Wallet Switcher Shortcuts
  - Press `/` from the Wallet Switcher list to focus on the Search input field
  - This allows you to use `W` and `/` in succession from the core wallet screen to quickly switch to the wallet you’re looking for, without touching your mouse.
  - You can even toggle the extension open and closed with `Option-Shift-R` on macOS or `Alt-Shift-R` on Windows.
- dApp Transaction and Signature Prompt Shortcuts
  - Press `ESC` to deny a transaction or message signature request popup
- dApp Connection Prompt Shortcuts
  - Switch Wallet Shortcuts (`1` `2` `3` etc. hotkeys) are now available within a dApp Connection Prompt. Just press a number hotkey to switch to the wallet you’d like to connect.
  - Press `W` to open the Wallet Selection menu to see your list of wallets and their corresponding number hotkeys
  - Press `N` to open the Network Selection menu to see the list of available networks. You can also use the `1` `2` `3` hotkeys to select the corresponding network
  - All of the menus throughout Rainbow can also be navigated with the `↑ ↓` arrow keys and `ENTER`
- Tokens Shortcuts
  - Click on a Token and quickly select a menu action with shortcuts
  - Swap Token: `X`
  - Send Token: `S`
  - View Token on Etherscan: `V`
- Activity Shortcuts
  - Click on a Transaction and quickly select a menu action with shortcuts
  - For confirmed transactions:
    - View Transaction on Etherscan: `V`
    - Copy Transaction Hash: `C`
  - For pending transactions:
    - Speed up Transaction: `S`
    - Cancel Transaction: `ESC`
    - Copy Transaction Hash: `C`
- Contacts Shortcuts
  - Click on the `...` more menu in the Send flow to manage a Contact
  - Copy Contact address: `C`
  - Edit Contact Name: `E`

### Changed

- Edit Wallets option now available during the Secret Recovery Phrase Import flow in Onboarding
- You will now hear a success or failure sound when completing the Secret Recovery Phrase quiz during Onboarding
- Onboarding UI consistency improvements

### Fixed

- Fixed unexpected navigation behavior when copying a wallet address in the Wallet Switcher
- Fixed scrolling in Wallet Switcher when the Tip is dismissed
- Fixed Send token selection clash for assets that use the same address across multiple networks
- Fixed Swap token Copy action inadvertent select behavior
- Fixed Wallet Switcher accent colors
- Fixed invalid address logic when attempting to Watch an Ethereum address
- Blocking navigation during Onboarding to resolve scenarios where a user could create multiple seed phrases simultaneously
- Clearing keychain on Welcome screen when no password is set
- Fixed out-of-bounds toast component edge cases
- Fixed a unique key console error message in Onboarding

## v1.0.132

### Added

- Swap Shortcuts
  - Top Input: `⌥ + ↑, ALT + ↑`
  - Bottom Input: `⌥ + ↓, ALT + ↓`
  - Flip Tokens: `F`
- Wallet Switching Shortcuts
  - `1` `2` `3` etc. hotkeys from core wallet screen will switch to your corresponding wallet
  - These numbers reflect the order of your wallets within the Wallet Switcher. You can always reorder wallets with a click-drag.

### Changed

- Removed “Save Contact” for imported/owned wallets
- Custom wallet ordering is now reflected in the Send wallet selector
- Removed accent colors in Onboarding flows

### Fixed

- Fixed spacing in Create Password screen title
- Fixed scrolling on Seed Backup and Seed Reveal screens
- Fixed Create Password back arrow styling (should be `flat` based on designs)
- Seed Phrase Quiz now appears on new seed phrase creation
- Now blocking wallet creation when a wallet is already being generated

## v1.0.123

### Added

- Send Shortcuts
  - Select Top Input `⌥ + ↑, ALT + ↑`
  - Select Bottom Input `⌥ + ↓, ALT + ↓`
  - Max Amount `M`
  - Switch Value `F`
  - Custom Gas `C`
  - Gas Menu `G`
  - Contact Menu `.`

### Changed

- Speed up & Cancel now handles more transaction scenarios, including swaps
- `priceimpact` support for cross-chain Swap quotes
- Copy address toast now appears on the Wallet Switcher
- Now displaying L2 native asset icons on dApp transaction prompts
- Onboarding grammar and punctuation consistency

### Fixed

- Fixed the More context menu click area for wallets in Wallet Details
- Fixed missing prices for destination swap assets
- Fixed swap `serviceTime` estimation alerts
- Home screen tab key keyboard navigation fixes
- Onboarding import flow text alignment consistency
- Fixed swap token row context menu margin
- Fixed padding and active highlight color when importing a seed phrase with 1 discovered wallet
- Fixed incorrect token icons in Swap token selection

## v1.0.118

### Added

- Swap & Bridge
  - Rainbow’s token swap & network bridge experience that you’re familiar with is now available within the extension!
  - Swap your tokens with confidence with Rainbow’s trusted Verified token list and control over your very own Favorites
  - Bridge your assets to and from Mainnet, Arbitrum, Optimism, Polygon, and BSC
- Flashbots toggle
  - You can now send all Mainnet transactions through Flashbots by flipping on a toggle in Settings
  - Flashbots can also be enabled for individual swaps within the Review screen
- Force Connect to dApps
  - You can now connect to a dApp from within the Rainbow extension by choosing Connect and a Network in the top-left dApp menu
- Keyboard Shortcuts available within the core wallet screen
  - Settings `,`
  - More Menu `.`
  - Close `Esc`
  - Lock `L`
  - Copy `C`
  - Swap `X`
  - Send `S`
  - Profile `P`
  - My QR Code `Q`
  - Connected Apps `D`
  - Wallet Switcher `W`

### Fixed

- Fixed contract deployment calls
- Unsupported `eth_` RPC methods now forward to Rainbow’s node provider
- Fixed transaction method names in Activity list, favoring Rainbow’s overrides
- Fixed swap quote search crash when value was undefined
- Fixed WETH-ETH swaps
- Fixed Custom Gas fee display
- Fixed lock screen UI bugs
- Fixed transaction time estimate label alignment
- Fixed missing asset prices for certain swap assets
- Fixed speed up and cancel

## v1.0.109

### Added

- My QR Code
  - A quick way to share your wallet address with others or scan it from a mobile wallet. Now available in the top-right menu of your wallets.
- Keyboard navigation and shortcuts for Settings, Tokens, and Activity

### Changed

- Now rejecting `eth_signTypedData_v4` RPC requests where the `chainId` doesn't match the session chain
- Improved dApp metadata and handling of long dApp names for Connect
- Better handling of long dApp URLs in Connected Apps

### Fixed

- Blocking native context menus on Right Click
- Fixed shadow clipping on Tokens and Activity in Light Mode
- Disconnect All button border display bug

## v1.0.99

### Changed

- Better dApp metadata and shorthand names
- Added missing RPC methods used by OpenSea
- When deleting the last wallet, we now wipe the keychain and send you to the welcome screen to start with the onboarding process again
- Ellipsis for long-name dApps in dApp Connect request
- Added spinner to unlock button
- Added spinner to the CTA of all the dApp requests
- Added spinner on create wallet button
- Added accent color to password input
- Contact text wrapping

### Fixed

- Fixed seed word table going into a different row when length is too long

## v1.0.89

### Added

- Right-click Quick Actions for Tokens & Activity
  - Tokens: Swap, Send, or view a token on Etherscan
  - Activity: View a transaction on Etherscan, or Copy transaction hashes
- Toasts UI on Copy actions in Onboarding

### Changed

- Improved gas speed defaults for Arbitrum, Optimism, and BSC
- Added native asset amount and native price on dApp transaction prompts
- Alerts and Context Menus are now dismissed with Esc key shortcut

### Fixed

- Fixed the private key export flow in Settings
- Fixed Onboarding import wallet spacing inconsistencies
- Fixed Onboarding recovery phrase quiz alignment for long words
- dApp Prompts now dismiss without triggering navigation flashes
- Fixed flash of wallet screen in auto-lock state
- Fixed dApp icons that were missing or wouldn’t load
- Fixed Activity cell USD estimate text alignment

## v1.0.70

### Added

- Use `Option-Shift-R` on macOS and `Alt-Shift-R` on Windows to quickly open the extension from any dApp

### Changed

- Sends for Layer 2 networks will now show a Pending spinner in Activity
- Images and avatars resolved from ENS will now load much faster
- Faster Token and Assets fetching
- New alert UI for dApp interaction attempts for Watched wallets
- Argent addresses now produce a warning in the Send flow to prevent users from incorrectly sending funds to Argent smart contract wallets

### Fixed

- Fixed an issue that caused some contract interactions to be malformed and fail
- Fixed test overflow for tokens with lengthy names
- Fixed an issue that prevented users from creating a wallet without specifying a name
- Improved maxFee gas estimates for Custom Gas transactions
- Fixed private key imports for keys without 0x
- Fixed the Coming Soon alert for users that try to interact with Swaps
