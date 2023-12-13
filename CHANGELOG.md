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

### Internal

### Testing

## [v1.3.5](https://github.com/rainbow-me/browser-extension/releases/tag/v1.3.5)

### Internal

- Resolved an issue with Rainbow Points feature flag coverage #1195

## [v1.3.0](https://github.com/rainbow-me/browser-extension/releases/tag/v1.3.0)

### Added

- You can now view all of your NFTs and NFT collections in Rainbow, just like the app. Head over to the new NFTs tab to view your Gallery and explore your NFTs with rich insights, including Floor Prices, Unique Owners, Rarity, and more #1182
- Rainbow Points are here. True believers are always rewarded. [Learn more](https://rainbow.me/points) #1165 #1170 #1184 #1174 #1189

### Changed

- Drastically improved image fetching and rendering for Tokens, NFTs, and Avatars to make Rainbow feel even faster #1183

### Fixed

- Resolved interface shift when loading Tokens and Token Charts #1164
- Improved Onboarding Secret Recovery Phrase verification language #1172

### Internal

- Added Floor Price Explainer for NFT Details #1169
- Added autocomplete for a list of Networks in the Custom Networks flow #1177 #1179
- Now providing all `chainIds` in Backend requests #1187
- Now counting Custom Network assets in the token count, aggregated balance, and properly sorting the assets #1186
- Resolved an issue with `chainId` conflicts for Custom Networks and the Networks menu filtering #1185
- Upgraded `vite` to `4.5.1` to resolve CI checks #1176

## [v1.2.94](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.94)

### Fixed

- Resolved reliability issues with malicious transaction detection upon dapp requests, and improved readability of Rainbow Canary warnings #1168
- Fixed a formatting issue with `eth_estimateGas` and `eth_gasPrice` RPC calls for dapps that could trigger an error and cause dapps to be unreliable #1163

### Internal

- Added "Registered on" and "Expires in" rows in NFT Details for ENS assets #1166
- Fixed missing Flashbots toggle store migration to improve developer workflow on rehydrations #1171

## [v1.2.88](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.88)

### Added

- Added Testnet support for Holesky, Arbitrum Sepolia, Optimism Sepolia networks #1147

### Changed

- Improved translations for Magic Menu actions, and Transaction Simulation and Decoding #1160

### Fixed

- Fixed dApp prompt positioning when using multiple windows and monitors #1151
- Improved keyboard navigation consistency on dApp signature requests. Press `⌘+↵` to sign a message or transaction, `esc` to reject, and `tab` to navigate options #1148
- Fixed an issue with native token balance resolution where you may sometimes see an incorrect "Insufficient ETH" error when switching between multiple dApps and wallets #1157
- Fixed a rendering issue with price change estimates for Token Charts when the time window is changed #1145
- Fixed a community reported issue where Rainbow's Firebase infrastructure would be incorrectly injected into dApps and trigger unnecessary network calls #1159

### Internal

- Added support for `wallet_watchAsset` RPC call #1141
- Added Custom RPC Settings form validatin to test RPC endpoints #1144
- Added NFT Gallery loading and empty states #1152 #1155
- Added NFT Keyboard Navigation and sorting Shortcuts #1154
- Added Owners and Distinct Owners fields in NFT Details #1153
- Added ENS Profile resolution to NFT Details variant for ENS domains #1161
- Filtering Custom Network assets in Testnet Mode #1158
- Filtering Custom Networks from the Swap UI #1150
- Fixed a fetching clash between NFTs and Custom RPC assets #1156

## [v1.2.78](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.78)

### Added

- Canary is now available to help you easily preview and simulate your transactions — all automatic and super fast. When Rainbow detects a transaction or dapp that appears malicious, Canary will warn you before you submit a bad transaction and lose your funds #1085
- Added an "Enable Flashbots" toggle in the Magic Menu to submit all Mainnet transactions to Flashbots #1070
- Added an "Export Addresses as CSV" feature in the Magic Menu to export information about your wallets to improve your wallet management workflow and help you out during Tax Season #1097

### Changed

- Simplified the network support checkbox confirmations during the Send flow #1135

### Fixed

- Fixed a "price not available" rendering issue on Token Charts when fetching the latest price #1143

### Internal

- Added NFT Details interface for NFTs #1128
- Added support for `wallet_addEthereumChain` RPC call #1133
- Added transaction persistence for transaction submitted on Custom Networks #1134
- Optimize NFT Gallery with Infinite Query refactor #1129
- Whitelisted RPCs for Ethereum Holesky and Optimism Sepolia #1142
- Whitelisted RPCs for Arbitrum Goerli and Arbitrum Sepolia #1139

### Testing

- Disabled Testnet testing in Firefox #1137

## [v1.2.71](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.71)

### Changed

- Turned on support for Rainbow's RPC to improve transaction reliability, protect your privacy, and allow Custom Networks and RPCs in the near future #1125
- Improved translations for Networks settings, Developer Tools and Testnet Mode, Malicious dApp warnings, Wallet management right-click menus, Clear transactions, and Points #1122 

### Fixed

- Resolved an issue where the About section for Tokens would sometimes be missing #1115
- Ensuring a Swap pair prepopulates with the correct token when right-clicking a token to Swap #1118
- Resolved an issue with Token filtering when a chain was hidden in Networks settings #1124
- Fixed an issue with Send flow for Testnets that would cause native asset transfer transactions to be malformed #1130
- Resolved an issue where EIP-712 signature requests did not trigger a Dapp Prompt when `chainid` was unavailable #1121
- Fixed a UI overflow in Activity for transactions with lengthy names #1116

### Internal

- Added NFT Gallery and NFT sorting feature #1082
- Added low-level Custom Network support #1071
- Added Custom Network asset and price, symbol discovery #1120 #1111
- Added Asset Price and Chart fetching, and Chain icons for Custom Networks #1123
- Bumped `chromedriver` from `119.0.0` to `119.0.1` #1126
- Bumped `axios` to `1.6.1` #1131

## [v1.2.64](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.64)

### Added

- Testnet Mode is now available to safely interact with testnets and view testnet assets. Enable Developer Tools today in the Networks menu in Settings or with the Magic Menu, and toggle Testnet Mode with the `t` hotkey or by using the menu at the top-right of the wallet interface (#1057, #1113, #1109, #1106, #1108, #1110)
- When attempting to sign a mainnet transaction while Testnet Mode is active, you will now encounter a warning for extra workflow safety #1083

### Changed

- Network Settings are now accessible through the Magic Menu #1108

### Fixed

- Resolved an issue where the Network Changed notification had stopped appearing in dapps #1101
- Fixed an overflow issues in the Token Right-click menu for tokens with long names #1098
- Fixed missing strings for the Fee on Transfer Token explainer in Swaps #1084
- Improvements to various strings and translations thanks to community feedback #1081

### Internal

- Developer settings for Custom RPCs and Custom Assets for the upcoming Custom Networks feature (#1090, #1100)
- Merged the groundwork for NFT support with the `useNfts` fetch hook #1067
- Refactored local storage usage with a wrapper and logging to investigate storage quota overflows #1102
- Patching [GHSA-xwcq-pm8m-c4vf](https://github.com/advisories/GHSA-xwcq-pm8m-c4vf) with `crypto-js` resolution for the Ledger integration #1091
- Patching vulnerabilities by bumping `yaml` and `browserify-sign` #1099
- Upgraded SF Symbols to v5 #1108
- Upgraded `chromedriver` for the latest Chrome support #1107

### Testing

- Expanded end-to-end test coverage for networks and Testnet Mode #1075
- Adopting `findByTestId` in e2e tests for reliability #1093

## [v1.2.56](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.56)

### Fixed

- Resolved a crash when quickly switching tabs #1089
- Fixed tab selection and restoration when using Rainbow in Full Screen #1089

## [v1.2.54](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.54)

### Added

- A preview of Rainbow Points is here. True believers are always rewarded. #1078
- Users can now clear troublesome pending transactions with a new button in the Transactions menu in Settings #1072

### Changed

- Right-click is now available in the Wallets & Keys menu in Settings to make wallet management even easier #1054

### Fixed

- Resolved an issue where Rainbow would not be available to dapps that supports EIP-6963 or `window.ethereum.providers` when the default wallet toggle was disabled #1079

## [v1.2.48](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.48)

### Added

- A new Networks menu is available in Settings to hide networks and their assets throughout Rainbow. Yon can also drag to reorder networks to access your favorite chains even faster #1044
- Users will now encounter warnings when attempting to connect to or sign transactions and messages on dapps that appear to be malicious and harmful #1051
- Korean, Thai, and Arabic language support is now available in Settings #1052

### Changed

- Improved the consistency and reliability of the switch wallet banner when viewing a different wallet than what is currently connected to the dapp #996
- Swaps are even faster now with 1 less click when selecting a swap pair #1060
- The network switcher dropdown filter in Swaps can now be navigated using the keyboard #1043
- Enhanced error handling and crashes with a new interface to report issues directly to the Rainbow team #1042

### Fixed

- Corrected an issue where the network switcher for dapps in the top-left displayed inaccurate numbered hotkeys #1053
- Fixed an issue where some token bridging routes would appear in the Bridge feature for unsupported networks #1055
- Improved language strings throughout the Swap and Bridge interface #1059
- Implemented a fallback dapp icon for dapps without a favicon or for icons that fail to load #1050
- Removed a log that appeared while rendering external images #1068

### Internal

- Introduced public provider routing for RPC calls, and added support for Rainbow's RPC for future use. This is not currently enabled in production #1058

### Testing

- e2e: testing shortcuts in Swaps #1041
- e2e: Optimism L2 Sends are now covered with tests #1048

## [v1.2.39](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.39)

### Added
- Bridging is easier than ever when right-clicking on a token or choosing to Bridge from the Token Details pane #997
- You can now connect to all major Testnets for Rainbow's supported networks to sign and send testnet transactions. When connecting to or switching networks from a dApp that supports Testnets, you'll automatically be connected to the correct testnet by default, without needing to manage an RPC or network list. #1027

### Changed
- Right-click is now available in even more places, like the wallet header to manage your wallet, Send, Swap, the Wallet Switcher, and the Wallets & Keys menu in the Settings interface #1017 #1004
- The default tab when opening the wallet is now Tokens instead of the Activity pane #1029
- Links within descriptions for Tokens are now clickable #1019
- Support for keyboard navigation within the Custom Gas menu #1021
- Support for keyboard navigation in the Token Details pane #1013
- Support for keyboard navigation within Swap Settings
- Improved keyboard navigation for the Flip Assets feature in Swap #1023

### Fixed
- Improved handling of hex-encoded signature requests for `personal_sign` support for Ledger and Trezor hardware wallets #1035
- Resolved an issue where Rainbow over-fetched metadata for dApps as users navigated the web. Rainbow now only fetches metadata for dApps that first interact with the Rainbow RPC provider #1038
- Allowance field no longer appears in Token Details if there is no contract approval allowance to display #1045
- `ESC` hotkey can now be used to close Token Details #1058
- Fixed image clipping for token images and NFT previews in the Activity transactions list #1040
- Improved spacing in the `Del` shortcut hint bubble for the menu to Cancel or Speed up a transaction #1030

### Security
- Deprecated support for dApps that rely on the vulnerable `eth_sign` method for signatures #1049
- Sanitizing fields in EIP-712 signature requests to mitigate common phishing attacks #1028

### Internal
- Added debounce to some fee calculations in Send flow #1032
- Stricter Sentry filtering on `beforeSend` #1036
- Reduce price/coingecko queries in swap search list #1033

### Testing
- e2e: Send Shortcut test #1002
- e2e: shortcut wallet switcher test #1037


## [v1.2.36](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.36)

### Added

- When hovering over icons and buttons throughout Rainbow, you will now see tooltips that tell you more about the feature and highlight keyboard shortcuts #930

### Changed

- Filtering unverified asset results in Swap Search for short search strings to speed up search #1001
- Improvements to Wallet Switcher banner logic #996
- Support for keyboard navigation in Token Details #1013

### Fixed

- Filtering imported Private Keys from Wallet Group creation flow #988
- Fixed a scenario where you couldn’t imported the Secret Recovery Phrase for Watched Wallets #987
- Restored shortcut hints on the Tokens Right-click menu #1011
- Fixed an issue where the MATIC symbol was missing during the Swap flow when the user did not already own that asset #990
- Resolved an issue with EIP-6963 support where we announce the provider before attempting EIP-1193 `window.ethereum` injection, which can fail #994
- Resolved a crash during provider injected that prevented in-dApp notifications during network switching #1005
- Resolved duplicate inpage id logs during provider injection #999
- Prefetching dApp metadata before interacting with a dApp’s prompts #1009
- Fixed inaccuracies with exchange rate field for transactions in Activity Details #1022
- Fixed an issue with Layer 2 network Sends that caused transaction failures during internal testing due to invalid max priority fees #1025
- Resolved an issue where the Wallet Details drop-down could overlap with the Rename Wallet modal #1010
- Fixed background color inconsistencies in the Wallet Selection step of Import during Onboarding #1006
- Truncating lengthy ENS names on Activity Details #944
- Improved Context Menu sizing reliability #973
- Improved layered context menus animations and sizing in the dApp Menu #1018

### Internal

- Added a dev setting to clear nonces #993
- Cryptography library upgrades beyond Ethers v5, and evaluating path to Viem upgrade #1007
- Refactored AccentColorProvider component, and deprecated AccentColorProviderWrapper #1003
- Updated i18n translations #998
- Resolved an issue with how we count imported wallets in tracking #989
- Resolved an issue with the Publish GitHub Action #1024
- Upgraded to Node 18 from 16 for Firefox support #1020
- Upgraded `deep-object-diff` to resolve dependency audit issues #1000
- Upgraded `vite`, `vitest`, and `chai` #1015

### Testing
- e2e coverage of Home shortcuts #942

## [v1.2.26](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.26)

### Added

- You can now Buy crypto from our On-ramp Partners with the Buy button, and Transfer Crypto for free from Coinbase for new wallets #957 #976
- Legacy Ledger HD derivation paths are now supported via a drop-down option while pairing your Ledger device #929
- Indonesian language support is now available in Settings #937
- You will now see improvements to dApp naming and other metadata, tailored by the Rainbow team. Let us know if we missed any! #955
- Rainbow is now open source and licensed under GPLv3 #965

### Changed

- Rainbow has a new look and feel with a new Tab Bar to navigate between Activity, Tokens, and NFTs #962
- The Command K interface is now the Magic Menu and is available as `⌘K` on macOS, `Ctrl-K` on Windows, and simply `k` across all platforms #982
- The nudge to Switch Wallets while interacting with a dApp has a new look and feel, and now appears immediately for an even faster switching experience #980
- You can now disable Sounds with a toggle in Settings #953
- Keyboard navigation now fully supports the Onboarding flow #924
- Context menus are now dynamically sized for better localization support #949

### Fixed

- Resolved an issue where connections with Ledger devices was unreliable and blocked interactions like Swaps #983
- Resolved an issue where the Create Wallet action in the Magic Menu incorrectly routed to the Welcome screen #959
- Handling a scenario where Home actions wouldn't appear when fetches for an ENS avatar failed #946
- Fixed a crash when dApp session data is temporarily unavailable #947
- Fixed a crash on the Lock screen that periodically prevented users from unlocking the extension #947
- Fixed a crash on the Wallet Details interface when removing a Secret Recovery Phrase attached to multiple wallets #947
- Improved transaction pagination reliability in Activity for wallets with many filtered transactions, including ProtocolRewards events #960
- Resolved an issue where keyboard navigation to the Token Details interface clashed and opened the right-click menu #974
- Adjusted the logic for Backup Reminders to rely on when a user confirms "I've saved these words" #978
- Prevent resizing animation jitters on presentation of Activity Details with loading skeletons for affected rows #945
- Resolved a display issue for cross-chain swaps on the Activity pane #948
- Resolved an issue where you could use the `s` hotkey on Watched wallets #954
- Resolved a clash where the new Tab Bar would appear over Pending Transaction prompts #979
- Fixed an alignment inconsistency for Activity transaction cells #969
- Improved icon fallbacks for NFTs that fail to load for Activity transactions #970
- Favoring a dApp's hostname when other metadata is unavailable on prompts #971
- Fixed copy for Stronger Password recommendations during Onboarding #975
- Resolved an issue where wallet avatars could be clipped when using an Emoji #977
- Resolved issues with the border radius of remotely fetched images throughout the interface #981

### Removed

- Rainbow is now available to all without an invite code. We've removed this step from Onboarding #963

### Internal

- Refactored the initial load of i18n strings on cold boot #950
- Refactored wallet avatar fetching and added a cache #958
- Improved fallbacks and handling of Backend-driven transaction types for contract interaction Activity cells #972
- Updated i18n translations for Activity Details #951
- Improved Sentry logging for Send, Import, and Hardware Wallet pairing keychain interactions #961
- Publish actions are now seperate for Chrome and Firefox stores #964
- Upgraded `@ledgerhq/hw-app-eth` and `@ledgerhq/hw-transport-webhid` and accompanying patches and Wekpack configuration #983
- Upgraded `@metamask/eth-sig-util`, `@trezor/connect-plugin-ethereum`, `@ledgerhq/cryptoassets`, `wagmi`, `zustand`, Sentry, Webpack, and LavaMoat packages #956

## [v1.2.21](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.21)

### Added

- Transactions are now even easier to read with rich metadata when scrolling through your Activity list. You can also see detailed transaction information when clicking on each transaction #853
- Support for EIP-6963 to improve the dApp connection experience and mitigating `window.ethereum` namespace conflicts and overrides for users with multiple active extensions #926
- Reminders to backup Secret Recovery Phrases for users that have created a new wallet and skipped the backup and quiz verification #931

### Changed

- Wallet switching is faster than ever. Give it a try by using the numbered hotkeys to rapidly switch between wallets in your list #940
- After sending a Swap or Send, you'll now jump right to the Activity tab to follow the transaction progress #936

### Fixed

- Fixed a crash on Zora and Base when sending transactions because of invalid the Optimism L1 Security fees #933
- Resolved an issue with the Immediate auto-lock preference, where the wallet would not always immediately lock, and users could get stuck in an auto-lock loop after attempting to unlock #939
- Fixed an issue where the first submitted transaction for a generated wallet would not properly appear as pending #936
- Fixed an issue where Swaps and Sends were persisted by state restoration even after a successful transaction submission #935
- Resolved an issue where the slippage percentage for Swaps would sometimes appear as `-Infinity%` or `NaN%` #938
- Resolved an issue with USD estimates for Swap quotes on a subset of networks #934
- Resolved a theme conflict for WETH tokens in dark mode #928

### Internal

- Improved Swap analytics event with standardized `tradeAmountUSD` values returned from the Quote API #927
- Refactoring the inpage provider injection script and deprecating the `window.ethereum.providers` proxy #919
- Bundle size optimizations #932
- Type safety improvements with `AddressOrEth` type #896

### Testing

- Helpers for shortcut e2e tests #941
- Resolved an e2e test failure within the Send flow #943

## [v1.2.13](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.13)

### Changed
- Introduced a transaction submission loading spinner for the "Send" button in the Send feature, mirroring the behavior in Swaps #916
- Implemented an explainer for tokens that aren't supported in Swaps because their contract requires a fee on transfer #917

### Fixed
- Resolved an issue with Rainbow's "default wallet" toggle behavior for users that interacted with dApps across multiple tabs simultaneously #906
- The dApp and More menus on the core wallet screen can now be toggled properly with the `n` and `.` hotkeys #913
- Resolved a conflict where the `w` hotkey for the Wallet Switcher could be triggered while the dApp menu is active #913

### Internal

- Resolved an issue with development hot reloading #920

### Testing

- Improvements to e2e reliability, and disabling unstable tests on Firefox #921

## [v1.2.11](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.11)

### Changed
- Temporarily disabled hardware wallet support on Firefox due to browser restrictions #907
- Enhanced internalization support for multi-lingual store listings on the Chrome Web Store #895

### Fixed
- Resolved an issue where some pending transactions would get stuck in the Activity list or transaction nonces would be incorrect for users simultaneously sending transactions across multiple wallets or networks #914
- Improved transaction gas estimation reliability on Base, Arbitrum, Optimism, and Zora with Rainbow estimates #911
- Improved gas estimation support for OP Stack chains with an L1 security fee #911
- Improved behavior on dApps that use Web3Modal by supporting the expected `window.ethereum.providers` provider ordering #910

### Internal
- Upgraded to TypeScript 5 to enhance type safety #890

### Testing
- Shortcuts support for end-to-end tests #899
- Addressed timeouts in end-to-end testing to foster more consistent results #909

## [v1.2.3](https://github.com/rainbow-me/browser-extension/releases/tag/v1.2.3)

### Added

- When accidentally closing the extension while preparing a Swap or Send or managing your wallets in Settings, Rainbow will now restore your state and let you continue where you left off #878
- You can now Disconnect (`D`) your wallet or Switch Wallet (`W`) to change the wallet connected to a dApp from the dApp Menu in the top-left. You can always open this menu with the `N` shortcut, and follow the shortcut hints to drill-down without touching your mouse #866

### Changed

- Flashbots support now includes more builders for faster transaction inclusion #903
- Provider injection is now available for Firefox for a future release #859

### Fixed

- Resolved issues with nonce management and transaction submission reliability for users that interact across multiple wallets and networks simultaneously #891
- Fixed an issue with the Activity pane when using Rainbow in Full Screen mode #889
- Resolved transaction caching issues on the Activity pane that caused unnecessary network refreshes #905
- Fixed a potential crash when fetching output-based Swap quotes #887
- Improved anonymized logging to better diagnose wallets with keychain store issues #892

## [v1.1.79](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.79)

### Added

- Command K (⌘K or Ctrl+K) is now available to search and launch screens, toggle settings, search your wallets and tokens, and search ENS and public addresses to quickly watch a new wallet. ⌘⏎ or ⇧⏎ are available to expose additional actions for wallets and tokens. Press ESC to go back or close. #869
- dApp Account Switch functionality when switching wallets while interacting with a dApp #845 #863 #860
- Language option in Settings and internationalization support for Latin American Spanish, Simplified Chinese, Japanese, French, Brazilian Portuguese, Hindi, Turkish, and Russian #817

### Changed

- State restoration for the Swap and Send flows so that user selections and input are sticky for a short period of time for when you need to close the pop-up or back-out to copy an address #852
- Paginated scroll and loading indicators on the Tokens and Activity interfaces for heavy wallets #880
- Analytics for anonymized metrics on the types of wallets our users interface with in Rainbow #805 

### Fixed

- Resolved regression in Right-click support for Tokens #865
- Fixed an issue with dApps that support `window.ethereum.providers` when Rainbow is toggled as the default browser wallet #867
- Resolved an issue that could cause wallet discovery to fail during Onboarding #868
- Improved pricing chart fallbacks and hovering behavior in Token Details #865
- Improved Hide Small Balances toggle reliability #870
- Fixed a white screen flash that would sometimes appear when launching Rainbow #877
- Resolved a crash in browsers without support for IndexedDB before attempting to initialize our Firebase configuration #864
- Color shading consistency on the dApp Switch Network menu #761

## [v1.1.70](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.70)

### Fixed

- Resolved an issue that caused some users to experience a loop where creating or importing a wallet during Onboarding could bring them back to the initial Onboarding step #861

## [v1.1.67](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.67)

### Changed

- Improved token caching in scenarios where network requests fail #843
- Improved styling in preparation for Firefox support #842
- Removed Send and Swap buttons in Token Details for watched wallets #849

### Fixed

- Resolved a crash that could be caused by an invalid dApp url #857
- Fixed a memory leak in Alert components #849
- Blocking interaction with Swap and Send confirmation buttons while gas is being fetched to prevent invalid transactions from being dispatched #824
- Resolved an issue that could lead to an infinite loop when syncing keychain stores #851
- Improved logic in dApp provider throttling and resolved a potential crash #855
- Resolved a crash when pricing data is unavailable for Token Details charts #856

## [v1.1.59](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.59)

### Added

- The "Auto-hide balances under $1" toggle in Settings is now available to automatically filter out spam and token dust #818

### Changed

- Introduced a new alert when attempting to sign a message or transaction for a Ledger wallet when the device is disconnected #826
- Added an Unsupported Browser explainer during Onboarding for unsupported browsers with known issues, including Kiwi Browser #828
- When fetching additional transactions when scrolling the Activity list, a new loading indicator is available #830
- Migrated to a more efficient transactions API and introduced pagination in the Activity list #816 #827
- Improved empty state loading skeletons for the Tokens and Activity interfaces #833
- The wallet header will now consistently collapse when scrolling Tokens on wallets with a limited number of assets #831
- Keyboard shortcut and navigation analytics #837

### Fixed

- Fixed a crash for Trezor devices if connectivity is established more than once #819
- Fixed a crash on dApp interactions if address or chain metadata was unavailable #822
- Resolved an issue that prevented clicking the Terms of Service link during Onboarding #823
- Fixed a bug where the Connected Apps network badge wouldn't display properly #825
- Fixed a bug where wallet name in the Header couldn't be selected with tab keyboard navigation #832
- Resolved an issue where the user would be asked to create a password again after updating their password in Wallets & Keys in Settings and then using the back button #834
- Fixed an issue where a user couldn't create a name for a wallet after creating a new Wallet Group #836
- Improved logging for dApp message signing errors to diagnose problematic dApps #821

## [v1.1.48](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.48)

### Changed

- Adopted Socket v2 contracts for gas optimization for token bridging #814
- Adopted colloquial BSC naming for Binance Smart Chain #768
- Added support for deprecated `send` and `sendAsync` RPC calls #792
- Rate limiting dApps that abuse the `window.ethereum` RPC provider #785
- Analytics for device context to learn about our user’s browsers #776
- Analytics for screen routing events to follow user journeys #775

### Fixed

- Improved keychain vault stability to resolve an issue where the extension could appear like the user had not yet onboarded #813
- Resolved an issue with Ledger account discovery for users with more than 1 address #807
- Resolved an issue where dApps would not reflect a disconnection when using Disconnect All #806 
- Fixed an issue with the `window.ethereum` provider when no other wallets were injected #800
- Fixed a crash in the Recovery Phrase Seed quiz #780
- Fixed a crash in Edge when a New Tab is opened #811
- Fixed an issue with the styling of the Network Changed notification on certain dApps #809
- Removed unnecessary console logs #769

## [v1.1.40](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.40)

### Changed

- Keyboard navigation for dApp prompts is now even easier. Connect to a dApp with `return` and `tab` between Wallets and Network selection more quickly. Smart defaults ensure that you won't accidentally sign or send a transaction, with cancel/rejection actions always the default. #592
- The native currency values are now editable in the Swap flow so that you can i.e. swap $100 USD of ETH to a different token, without manually estimating token amounts #702
- You can now confirm a Swap or Send with the keyboard `return` key, and navigate around with `tab` and arrow keys to adjust settings #699 #763
- Improved lengthy token amount display behavior in the Swap flow when using the Max feature #711
- The destination Wallet Selection in Send is now collapsible by clicking the drop-down cell #712 #758
- Improved header scroll animation and feel #691 #748
- Improved token click and wallet reorder animation polish #762
- You can now dismiss Swap Settings pop-ups by clicking outside the sheet #743
- Renamed to `Binance Chain` chain to `BNB Smart Chain` #716
- Renamed `Polygon (Matic)` chain to `Polygon` #737

### Fixed

- Improvements for `eth_requestAccounts` and `eth_accounts` RPC calls to mirror MetaMask, as well as param order inversion support #730
- Ledger connection fixes, including “device is already open” scenario and waiting for the transport to closed #720
- Improvements to dApp provider responsiveness, including network and account changes sent from a dApp #722
- Fixed analytics toggle that would get stuck in the on position #759
- dApp Prompts in Arc are now sized correctly and include a background #744
- Fixed shortcut instruction UI on the Welcome screen on Linux #742
- Improved Token right-click Send flow to correctly highlight wallet selection instead of token selection #714
- Fixed a scenario where you could inadvertently create a new wallet after canceling the create process during the naming step #726
- Fixed spacing on the green/red dApp connection indicator #721
- Fixed My QR Code styling to mirror the Rainbow App and RainbowKit #734
- Improved consistency of the Hide Balance setting in the Swaps flow #760
- Fixed an issue where clicking the wallet name on the My QR Code screen opened the Wallet Switcher #734
- Settings style fixes & tweaks #719
- Fixed Watched Wallet alert when Swap keyboard shortcuts are used #723
- Trimming whitespace when entering an ENS or public address to watch #681
- Fixed an issue where Swap input fields set by Max would be cleared when selecting a destination token #755
- Fixed an issue with keyboard navigation on dApp signature prompts where network drop-downs were highlightable #751
- Fixed a crash on dApp signature prompts when dApp session data is unavailable #713
- Fixed Sign Message crash in scenarios where the keychain is still booting #772
- Fixed a crash where the dApp session data could be unavailable and crash the Send flow #729 #718
- Fixed Send flow crash when an ENS name is unavailable #766
- Improved keychain boot/deserialization stability #735
- Fixed an issue where you could select the Send flow before the keychain is finished booting #727
- Resolved problem area when fetching from localstorage APIs to anticipate undefined when they’re still booting #728
- Network caching improvements for ENS Profile avatars #704
- Network query reliability and caching for asset discovery #745
- Improved error handling for multi-transactions like Swaps when existing transactions are pending #740
- Fixed React implementation issue with symbols that caused some console warnings in Settings #736
- Error handling for Trezor SDK initialization #770
- Improved Trezor integration logging to get error visibility #771 #765
- Improved Meterology integration to prevent bad gas data crashes #731

## [v1.1.17](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.17)

### Fixed

- Resolved an issue with wallet balances in the Wallet Switcher list #717

## [v1.1.15](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.15)

### Changed

- You can now dismiss alerts by clicking the blurred background area #698
- Improved keyboard navigation and tab highlighting in the Hardware Wallet connection flows #696
- Now waiting for users to complete Onboarding before injecting the Rainbow provider into dApps #686

### Fixed

- Fixed incorrect balances displayed in Wallet Switcher #706
- Assets are now sticky after a Swap so that you can refresh your asset list before token transfers are indexed onchain #672
- When using the extension in full screen mode for Hardware Wallet interactions, back buttons are now hidden #693
- Fixed white screen failure on Hardware Wallet connection success screen #694 #705
- Now ignoring invalid calldata when parsing and displaying transactions #710
- Improvements to Ledger Hardware Wallet connection management and cleanup upon disconnect #700
- Fixed scenario where the Send flow could break if the extension scripts had not yet been awoken by Chrome #709
- Fixed icon misalignments in Settings menu items #703
- Tweaked Wallet Group cell paddings and layout in the Wallets & Keys Settings #697

## [v1.1.12](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.12)

### Added

- Version numbers are now available at the bottom of Settings #687

### Changed

- Tailored Onboarding welcome screen "Pin Rainbow to your toolbar" for the Arc browser #674
- Analytics for Swap, Bridge, and Send submissions #656

### Fixed

- Major performance improvements for Tokens and Activity lists for large wallets #675
- Fixed crash when a Send transaction fails #685
- Fixed an issue with how Insufficient Gas errors were displayed for native gas tokens in Swaps #673
- Fixed missing copy scenario on wallet selection during the Secret Recovery Phrase import flow #684
- Fixed scenario where the Send wallet selection dropdown would not display any selectable wallets #688
- Fixed animations of Send token selection dropdown #688
- Fixed missing token highlight on Send token selection dropdown #688
- Fixed text line height cutoff on "No activity yet" empty state #653
- Compressed image and sounds assets for performance #689

### Security

- Added infrastructure and CI errors to further strengthen circular dependency vulnerability protections #680 #683

## [v1.1.5](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.5)

### Changed

- We’ve introduced new wallet recommendations for the “Watch an Ethereum address” step of Onboarding #633
- Analytics for global Flashbots RPC setting #657

### Fixed

- Wallets with an ENS name are now searchable in the Wallet Switcher #665
- Resolved incorrect empty state avatar before a wallet was selected on the Send flow #676
- Resolved a race condition where delays in fetching the Remote Config would mean Onboarding was not properly gated for Invite Codes #677

## [v1.1.0](https://github.com/rainbow-me/browser-extension/releases/tag/v1.1.0)

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
