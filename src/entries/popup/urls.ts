export const ROUTES = {
  ROOT: '/', // RootHandler
  HOME: '/home', // Home
  CONNECTED: '/connected', // ConnectedApps
  WELCOME: '/welcome', // Welcome
  IMPORT_OR_CONNECT: '/import-or-connect', // ImportOrConnect
  WATCH: '/watch', // WatchWallet
  IMPORT: '/import', // ImportWallet
  IMPORT__SELECT: '/import/select', // ImportWalletSelection
  IMPORT__EDIT: '/import/edit', // EditImportWalletSelection
  UNLOCK: '/unlock', // ImportWalletSelection
  SEED_BACKUP_PROMPT: '/seed-backup-prompt', // SeedBackupPrompt
  SEED_REVEAL: '/seed-reveal', // SeedReveal
  SEED_VERIFY: '/seed-verify', // SeedVerify
  CREATE_PASSWORD: '/create-password', // CreatePassword
  SETTINGS: '/settings', // Settings
  QR_CODE: '/qr-code', // QR Code
  SETTINGS__PRIVACY: '/settings/privacy', // Privacy
  SETTINGS__PRIVACY__AUTOLOCK: '/settings/privacy/autolock', // AutoLockTimer
  SETTINGS__PRIVACY__CHANGE_PASSWORD: '/settings/privacy/change-password', // ChangePassword
  SETTINGS__PRIVACY__WALLETS_AND_KEYS: '/settings/privacy/wallets-and-keys', // WalletsAndKeys
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS:
    '/settings/privacy/wallets-and-keys/wallet-details', // WalletDetails
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING:
    '/settings/privacy/wallets-and-keys/wallet-details/private-key-warning', // PrivateKeyWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY:
    '/settings/privacy/wallets-and-keys/wallet-details/private-key', // PrivateKey
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING:
    '/settings/privacy/wallets-and-keys/wallet-details/recovery-phrase-warning', // RecoveryPhraseWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE:
    '/settings/privacy/wallets-and-keys/wallet-details/recovery-phrase', // RecoveryPhrase
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_VERIFY:
    '/settings/privacy/wallets-and-keys/wallet-details/recovery-phrase-verify', // RecoveryPhraseVerify
  SETTINGS__TRANSACTIONS: '/settings/transactions', // Transactions
  SETTINGS__CURRENCY: '/settings/currency', // Currency
  SEND: '/send', // Send
  SWAP: '/swap', // Swap
  SIGN: '/sign', // Sign
  WALLETS: '/wallets', // Wallets
  WALLET_SWITCHER: '/wallet-switcher', // WalletSwitcher
  ADD_WALLET: '/add-wallet', // AddWallet
  NEW_WATCH_WALLET: '/add-wallet/watch', // NewWatchWallet
  NEW_IMPORT_WALLET: '/add-wallet/import', // NewImportWallet
  NEW_IMPORT_WALLET_SELECTION: '/add-wallet/import/select', // NewImportWalletSelection
  NEW_IMPORT_WALLET_SELECTION_EDIT: '/add-wallet/import/select/edit', // NewImportWalletSelectionEdit
  READY: '/ready', // WalletReady
  APPROVE_APP_REQUEST: '/approve-request',
  HW_CHOOSE: '/hw/choose',
  HW_LEDGER: '/hw/ledger',
  HW_TREZOR: '/hw/trezor',
  HW_TREZOR_LOADING: '/hw/trezor/loading',
  HW_WALLET_LIST: '/hw/wallet-list',
  HW_SUCCESS: '/hw/success',
};
