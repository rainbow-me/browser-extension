import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { TxHash } from '~/core/types/transactions';

export const ROUTES = {
  ROOT: '/', // RootHandler
  HOME: '/home', // Home
  TOKEN_DETAILS: (uniqueId: UniqueId | ':uniqueId') =>
    `/home/token-details/${uniqueId}`,
  ACTIVITY_DETAILS: (chainId: ChainId | ':chainId', hash: TxHash | ':hash') =>
    `/home/activity-details/${chainId}/${hash}`,
  NFT_DETAILS: (collectionUniqueId: UniqueId, tokenId: string) =>
    `/home/nft-details/${collectionUniqueId}/${tokenId}`,
  POINTS_REFERRAL: '/home/points-referral',
  POINTS_ONBOARDING: '/home/points-onboarding',
  POINTS_WEEKLY_OVERVIEW: '/home/points-weekly-overview',
  CLAIM_SHEET: '/home/claim-sheet',
  CLAIM_OVERVIEW: '/home/claim-overview',
  CONNECTED: '/connected', // ConnectedApps
  WELCOME: '/welcome', // Welcome
  IMPORT_OR_CONNECT: '/import-or-connect', // ImportOrConnect
  WATCH: '/watch', // WatchWallet
  IMPORT: '/import', // ImportWallet
  IMPORT__SEED: '/import/seed', // ImportWalletViaSeed
  IMPORT__PRIVATE_KEY: '/import/pkey', // ImportWalletViaPrivateKey
  IMPORT__SELECT: '/import/select', // ImportWalletSelection
  IMPORT__EDIT: '/import/edit', // ImportWalletSelectionEdit
  UNLOCK: '/unlock', // ImportWalletSelection
  SEED_BACKUP_PROMPT: '/seed-backup-prompt', // SeedBackupPrompt
  SEED_REVEAL: '/seed-reveal', // SeedReveal
  SEED_VERIFY: '/seed-verify', // SeedVerify
  CREATE_PASSWORD: '/create-password', // CreatePassword
  SETTINGS: '/settings', // Settings
  QR_CODE: '/qr-code', // QR Code
  SETTINGS__NETWORKS: '/settings/networks', // Networks
  SETTINGS__APPROVALS: '/settings/approvals', // Approvals
  SETTINGS__NETWORKS__RPCS: '/settings/networks/rpcs', // RPCs per network
  SETTINGS__NETWORKS__CUSTOM_RPC: '/settings/networks/custom-chain', // Networks Custom Chain
  SETTINGS__NETWORKS__CUSTOM_RPC__DETAILS:
    '/settings/networks/custom-chain/details', // Networks Custom Chain details
  SETTINGS__PRIVACY: '/settings/privacy', // Privacy
  SETTINGS__PRIVACY__AUTOLOCK: '/settings/privacy/autolock', // AutoLockTimer
  SETTINGS__PRIVACY__CHANGE_PASSWORD: '/settings/privacy/change-password', // ChangePassword
  SETTINGS__PRIVACY__WALLETS_AND_KEYS: '/settings/wallets-and-keys', // WalletsAndKeys
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS:
    '/settings/wallets-and-keys/wallet-details', // WalletDetails
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING:
    '/settings/wallets-and-keys/wallet-details/private-key-warning', // PrivateKeyWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY:
    '/settings/wallets-and-keys/wallet-details/private-key', // PrivateKey
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING:
    '/settings/wallets-and-keys/wallet-details/recovery-phrase-warning', // RecoveryPhraseWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__WIPE_WALLET_WARNING:
    '/settings/wallets-and-keys/wallet-details/wipe-wallet-warning', // WipeWalletWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__WIPE_WALLET_GROUP_WARNING:
    '/settings/wallets-and-keys/wallet-details/wipe-wallet-group-warning', // WipeWalletGroupWarning
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE:
    '/settings/wallets-and-keys/wallet-details/recovery-phrase', // RecoveryPhrase
  SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_VERIFY:
    '/settings/wallets-and-keys/wallet-details/recovery-phrase-verify', // RecoveryPhraseVerify
  SETTINGS__TRANSACTIONS: '/settings/transactions', // Transactions
  SETTINGS__CURRENCY: '/settings/currency', // Currency
  SETTINGS__LANGUAGE: '/settings/language', // Language
  SEND: '/send', // Send
  SWAP: '/swap', // Swap
  BRIDGE: '/bridge', // Bridge
  SIGN: '/sign', // Sign
  WALLET_SWITCHER: '/wallet-switcher', // WalletSwitcher
  ADD_WALLET: '/add-wallet', // AddWallet
  NEW_WATCH_WALLET: '/add-wallet/watch', // NewWatchWallet
  NEW_IMPORT_WALLET: '/add-wallet/import', // NewImportWallet
  NEW_IMPORT_WALLET_SELECTION: '/add-wallet/import/select', // NewImportWalletSelection
  NEW_IMPORT_WALLET_SELECTION_EDIT: '/add-wallet/import/select/edit', // NewImportWalletSelectionEdit
  CHOOSE_WALLET_GROUP: '/add-wallet/choose-group', // ChooseWalletGroup
  READY: '/ready', // WalletReady
  APPROVE_APP_REQUEST: '/approve-request',
  HW_CHOOSE: '/hw/choose',
  HW_LEDGER: '/hw/ledger',
  HW_TREZOR: '/hw/trezor',
  HW_WALLET_LIST: '/hw/wallet-list', // hw/walletList/index
  HW_SUCCESS: '/hw/success',
  BUY: '/buy',
} as const;
