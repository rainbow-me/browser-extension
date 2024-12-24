/* eslint sort-keys: "error"*/

import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';
import { KeyboardEventDescription } from '~/entries/popup/hooks/useKeyboardAnalytics';

import { screen } from './screen';

/**
 * All events, used by `analytics.track()`
 */
export const event = {
  /**
   * Called when the app crashes for any reason
   */
  appCrash: 'app.crash',
  /**
   * Called when the user completes the Swap/Bridge flow and submits a bridge transaction.
   * This event is only called when the user is bridging a mapped asset, whereas
   * `swapSubmitted` is called when the user is completing a cross-chain swap.
   */
  bridgeSubmitted: 'bridge.submitted',
  /**
   * Called when a commandK action is executed
   */
  commandKActionExecuted: 'commandK.actionExecuted',
  /**
   * Called when a commandK is closed
   */
  commandKClosed: 'commandK.closed',
  /**
   * Called when a commandK is opened
   */
  commandKOpened: 'commandK.opened',
  /**
   * Called when the user approves a network add request from the active dApp.
   */
  dappAddEthereumChainPromptApproved: 'dapp.prompt.add_ethereum_chain.approved',
  /**
   * Called when the user rejects a network add request from the active dApp.
   */
  dappAddEthereumChainPromptRejected: 'dapp.prompt.add_ethereum_chain.rejected',
  /**
   * Called when the user approves a connection request from the active dApp.
   */
  dappPromptConnectApproved: 'dapp.prompt.connect.approved',
  /**
   * Called when the user clicks the network switch dropdown in the dApp Connect prompt.
   */
  dappPromptConnectNetworkClicked: 'dapp.prompt.connect.network.clicked',
  /**
   * Called when the user switches networks in the dApp Connect prompt.
   */
  dappPromptConnectNetworkSwitched: 'dapp.prompt.connect.network.switched',
  /**
   * Called when the user rejects a connection request
   * with the Cancel button in the dApp Connect prompt.
   */
  dappPromptConnectRejected: 'dapp.prompt.connect.rejected',
  /**
   * Called when the user clicks the switch wallet dropdown in the dApp Connect prompt.
   */
  dappPromptConnectWalletClicked: 'dapp.prompt.connect.wallet.clicked',
  /**
   * Called when the user switches wallets from the dApp Connect prompt.
   */
  dappPromptConnectWalletSwitched: 'dapp.prompt.connect.wallet.switched',
  /**
   * Called when the user approves a send transaction request
   * with the prominent button in the dApp Transaction Request prompt.
   */
  dappPromptSendTransactionApproved: 'dapp.prompt.send_transaction.approved',
  /**
   * Called when the user clicks the Custom Gas
   * button in the dApp Send Transaction prompt.
   */
  dappPromptSendTransactionCustomGasClicked:
    'dapp.prompt.send_transaction.custom_gas.clicked',
  /**
   * Called when the user changes gas defaults with the Gwei
   * Settings drilldown UI in the Transaction Request prompt.
   */
  dappPromptSendTransactionCustomGasSet:
    'dapp.prompt.send_transaction.custom_gas.set',
  /**
   * Called when the user rejects a send transaction request
   * with the Cancel button in the dApp Transaction Request prompt.
   */
  dappPromptSendTransactionRejected: 'dapp.prompt.send_transaction.rejected',
  /**
   * Called when the user clicks the gas speed
   * setting in the Transaction Request prompt.
   */
  dappPromptSendTransactionSpeedClicked:
    'dapp.prompt.send_transaction.speed.clicked',
  /**
   * Called when the user changes the default gas setting
   * with the context menu in the Transaction Request prompt.
   */
  dappPromptSendTransactionSpeedSwitched:
    'dapp.prompt.send_transaction.speed.switched',
  /**
   * Called when the user approves a sign message request
   * with the prominent button in the dApp Sign Message prompt.
   */
  dappPromptSignMessageApproved: 'dapp.prompt.sign_message.approved',
  /**
   * Called when the user rejects a sign message request
   * with the Cancel button in the dApp Sign Message prompt.
   */
  dappPromptSignMessageRejected: 'dapp.prompt.sign_message.rejected',
  /**
   * Called when the user approves a sign typed data request
   * with the prominent button in the dApp Sign Message prompt.
   */
  dappPromptSignTypedDataApproved: 'dapp.prompt.sign_typed_data.approved',
  /**
   * Called when the user rejects a sign typed data request
   * with the Cancel button in the dApp Sign Message prompt.
   */
  dappPromptSignTypedDataRejected: 'dapp.prompt.sign_typed_data.rejected',
  /**
   * Called when the user approves the addition of a token from a dApp.
   */
  dappPromptWatchAssetApproved: 'dapp.prompt.watch_asset.approved',
  /**
   * Called when the user rejects the addition of a token from a dApp.
   */
  dappPromptWatchAssetRejected: 'dapp.prompt.watch_asset.rejected',
  /**
   * Called when the user switches networks from the dApp with a `switchNetwork` event.
   */
  dappProviderNetworkSwitched: 'dapp.provider.network.switched',
  /**
   * Called when the dapps hits the rate limit per second or minute.
   */
  dappProviderRateLimit: 'dapp.provider.rate_limit',
  /**
   * Called when keyboard navigation is triggered
   */
  keyboardNavigationTriggered: 'keyboard.navigation.triggered',
  /**
   * Called when a keyboard shortcut is triggered
   */
  keyboardShortcutTriggered: 'keyboard.shortcut.triggered',
  /**
   * Called when user views the Leaderboard tab within Points
   */
  pointsLeaderboardViewed: 'points.leaderboard.viewed',
  /**
   * Called when user copies their referral link
   * within Points and tracks if it was a code or link
   */
  pointsReferralCopied: 'points.referral.copied',
  /**
   * Called when user taps the claim button
   * within the Points / Eth rewards screen
   */
  pointsRewardsClaimButtonClicked: 'points.rewards.claim_button.clicked',
  /**
   * Called when user chooses which network to claim rewards on and the
   * code to claim is executed within the Points / Eth rewards screen
   */
  pointsRewardsClaimSubmitted: 'points.rewards.claim.submitted',
  /**
   * Called when user views the Rewards tab within Points
   */
  pointsRewardsViewed: 'points.rewards.viewed',
  /**
   * Called when user views the Points tab
   */
  pointsViewed: 'points.viewed',
  /**
   * Called when the popup entry is opened, including:
   * - extension popup
   * - new window
   * - onboarding or welcome page
   */
  popupOpened: 'popup.opened',
  /**
   * Called when the user completes a Revoke Approcal flow and submits the transaction.
   */
  revokeSubmitted: 'revoke.submitted',
  /**
   * Called when a user enters the send flow
   */
  sendOpened: 'send.opened',
  /**
   * Called when the user completes a Send flow and submits the transaction.
   */
  sendSubmitted: 'send.submitted',
  /**
   * Called when user disables tracking in Settings.
   */
  settingsAnalyticsTrackingDisabled: 'settings.analytics_tracking.disabled',
  /**
   * Called when user enables tracking in Settings.
   */
  settingsAnalyticsTrackingEnabled: 'settings.analytics_tracking.enabled',
  /**
   * Called when user disables Rainbow as default provider in Settings.
   */
  settingsRainbowDefaultProviderDisabled:
    'settings.rainbow_default_provider.disabled',
  /**
   * Called when user enables Rainbow as default provider in Settings.
   */
  settingsRainbowDefaultProviderEnabled:
    'settings.rainbow_default_provider.enabled',
  /**
   * Called when a user enters the swaps flow
   */
  swapOpened: 'swap.opened',
  /**
   * Called when the quote fails 'Insufficient funds' 'Out of gas' 'No routes found' and 'No quotes found'
   */
  swapQuoteFailed: 'swap.quote.failed',
  /**
   * Called when the user completes a Swap/Bridge and submits the transaction.
   * This includes cross-chain swaps, while `bridgeSubmitted` is instead called
   * for mapped asset bridge transactions where the `mainnetAddress` is equal.
   */
  swapSubmitted: 'swap.submitted',
  /**
   * Called when the user toggles Degen Mode in the Swap/Bridge flow.
   */
  toggledDegenMode: 'degenMode.toggled',
  /**
   * Called when the user views the token details screen
   */
  tokenDetailsErc20: 'token.details.erc20',
  /**
   * Called when the user views the NFT details screen
   */
  tokenDetailsNFT: 'token.details.nft',
  /**
   * Called when user completes or skips the wallet backup flow.
   * potential outcomes are 'succeeded,' 'failed,' or 'skipped.'
   */
  walletBackupQuizSubmitted: 'wallet.backup_quiz.submitted',
  /**
   * Called when the core wallet Tokens & Activity
   * screen is viewed or opened in the extension popup.
   */
  walletViewed: 'wallet.viewed',
} as const;

/**
 * Properties corresponding to each event
 */
export type EventProperties = {
  [event.appCrash]: { error: string };
  [event.bridgeSubmitted]: {
    /**
     * Symbol of the input asset being swapped.
     */
    inputAssetSymbol: string;
    /**
     * Human readable name of the input asset being swapped.
     */
    inputAssetName: string;
    /**
     * Contract address of the input asset being swapped.
     */
    inputAssetAddress: string;
    /**
     * `chainId` of the input asset being swapped.
     */
    inputAssetChainId: number;
    /**
     * Native amount quote of input asset being swapped.
     */
    inputAssetAmount: number;
    /**
     * The estimated USD value of the input asset being swapped.
     * TODO: implement USD estimates in the Swap/Bridge flow.
     */
    inputAssetAmountUSD?: number;
    /**
     * Symbol of the destination asset.
     */
    outputAssetSymbol: string;
    /**
     * Human readbale name of the destination asset.
     */
    outputAssetName: string;
    /**
     * Contract address of the destination asset.
     */
    outputAssetAddress: string;
    /**
     * `chainId` of the destination asset.
     */
    outputAssetChainId: number;
    /**
     * Native amount quote of destination asset.
     */
    outputAssetAmount: number;
    /**
     * The estimated USD value of the destination asset.
     * TODO: implement USD estimates in the Swap/Bridge flow.
     */
    outputAssetAmountUSD?: number;
    /**
     * Mainnet contract address of the mapped assets.
     */
    mainnetAddress: string;
    /**
     * The estimated USD value of the swap.
     */
    tradeAmountUSD: number;
    /**
     * Whether Degen Mode was used for the swap.
     */
    degenMode: boolean;
    /**
     * Whether a hardware wallet was used for the swap.
     */
    hardwareWallet: boolean;
  };
  [event.commandKActionExecuted]: {
    id?: string;
    label?: string;
    name?: string;
  };
  [event.commandKClosed]: undefined;
  [event.commandKOpened]: undefined;
  [event.dappAddEthereumChainPromptApproved]: {
    /**
     * `chainId` of the network suggested by the dApp.
     */
    chainId: number;
    /**
     * `rpcUrl` of the network suggested by the dApp.
     */
    rpcUrl: string;
    /**
     * `blockExplorer` of the network suggested by the dApp.
     */
    blockExplorerUrl: string;
    /**
     * Full url of the dApp requesting a connection.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappAddEthereumChainPromptRejected]: {
    /**
     * `chainId` of the network suggested by the dApp.
     */
    chainId: number;
    /**
     * `rpcUrl` of the network suggested by the dApp.
     */
    rpcUrl: string;
    /**
     * `blockExplorerUrl` of the network suggested by the dApp.
     */
    blockExplorerUrl: string;
    /**
     * Full url of the dApp requesting a connection.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptWatchAssetApproved]: {
    /**
     * `chainId` of the asset suggested by the dApp.
     */
    chainId: number;
    /**
     * `decimals` of the asset suggested by the dApp.
     */
    decimals: number;
    /**
     * `symbol` of the asset suggested by the dApp.
     */
    symbol: string;
    /**
     * `address` of the asset suggested by the dApp.
     */
    address: Address;
    /**
     * Full url of the dApp suggesting a token.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptConnectApproved]: {
    /**
     * `chainId` of the default network the dApp requested.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a connection.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptConnectNetworkClicked]: undefined;
  [event.dappPromptConnectNetworkSwitched]: {
    /**
     * `chainId` of the network the user selected in the prompt.
     */
    chainId: number;
  };
  [event.dappPromptWatchAssetRejected]: {
    /**
     * `chainId` of the asset suggested by the dApp.
     */
    chainId: number;
    /**
     * `decimals` of the asset suggested by the dApp.
     */
    decimals: number;
    /**
     * `symbol` of the asset suggested by the dApp.
     */
    symbol: string;
    /**
     * `address` of the asset suggested by the dApp.
     */
    address: Address;
    /**
     * Full url of the dApp suggesting a token.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptConnectRejected]: {
    /**
     * `chainId` of the default network the dApp requested.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a connection.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptConnectWalletClicked]: undefined;
  [event.dappPromptConnectWalletSwitched]: undefined;
  [event.dappPromptSendTransactionApproved]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a to send a transaction.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptSendTransactionCustomGasClicked]: undefined;
  [event.dappPromptSendTransactionCustomGasSet]: {
    /**
     * Gas base fee in Gwei.
     */
    baseFee: number;
    /**
     * Gas max base fee in Gwei.
     */
    maxBaseFee: number;
    /**
     * Gas miner tip in Gwei.
     */
    minerTip: number;
    /**
     * Warning message for Max base fee input.
     */
    minerTipWarning?: 'stuck' | 'fail';
    /**
     * Max total gas fee in Gwei.
     */
    maxFee: number;
    /**
     * Warning message for Max base fee input.
     */
    maxBaseFeeWarning?: 'stuck' | 'fail';
  };
  [event.dappPromptSendTransactionRejected]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a to send a transaction.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     * This will help us spot malformed dApp names to add to our overrides.
     */
    dappName?: string;
  };
  [event.dappPromptSendTransactionSpeedClicked]: undefined;
  [event.dappPromptSendTransactionSpeedSwitched]: {
    /**
     * Select speed setting.
     */
    speed: 'normal' | 'fast' | 'urgent' | 'custom';
  };
  [event.dappPromptSignMessageApproved]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a sign message request.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignMessageRejected]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a sign message request.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignTypedDataApproved]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a sign typed data request.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignTypedDataRejected]: {
    /**
     * `chainId` of the network where the transaction is sent.
     */
    chainId: number;
    /**
     * Full url of the dApp requesting a sign typed data request.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappProviderNetworkSwitched]: {
    /**
     * Full url of the dApp requesting a `disconnect` event.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
    /**
     * `chainId` of the network the dApp requested a switch to.
     */
    chainId: number;
  };
  [event.dappProviderRateLimit]: {
    /**
     * Full url of the dApp requesting a rate limit.
     */
    dappURL: string;
    /**
     * Domain of the dApp displayed to the user.
     */
    dappDomain: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
    /**
     * Type of rate limit that was hit - either per second or per minute
     */
    typeOfLimitHit: 'perSecond' | 'perMinute';
    /**
     * Number of requests made when rate limit was hit
     */
    requests: number;
  };
  [event.keyboardNavigationTriggered]: {
    /**
     * The key pressed to navigate
     */
    key: string;
    /**
     * The current screen
     */
    screen: keyof typeof screen;
  };
  [event.keyboardShortcutTriggered]: {
    /**
     * The key pressed to activate the shortcut
     */
    key: string;
    /**
     * The current screen
     */
    screen?: keyof typeof screen;
    /**
     * A description of the action triggered via the keyboard
     */
    type: KeyboardEventDescription;
  };
  [event.pointsLeaderboardViewed]: undefined;
  [event.pointsReferralCopied]: {
    /**
     * Was a `link` or `code` copied
     */
    type: 'link' | 'code';
  };
  [event.pointsRewardsClaimButtonClicked]: {
    /**
     * Claim amount in ETH
     */
    claimAmount: number;
  };
  [event.pointsRewardsClaimSubmitted]: {
    /**
     * claim amount in ETH
     */
    claimAmount: number;
    /**
     * claim amount in USD
     */
    claimAmountUSD: number;
    /**
     * which network of the three possible was selected
     */
    networkSelected: 'optimism' | 'base' | 'zora';
  };
  [event.pointsRewardsViewed]: undefined;
  [event.pointsViewed]: undefined;
  [event.popupOpened]: undefined;
  [event.settingsAnalyticsTrackingDisabled]: undefined;
  [event.revokeSubmitted]: {
    /**
     * Symbol of the asset being sent.
     */
    assetSymbol?: string;
    /**
     * Human readable name of the asset being sent.
     */
    assetName?: string;
    /**
     * Contract address of the asset being sent.
     */
    assetAddress?: string;
    /**
     * `chainId` of the send transaction.
     */
    chainId: number;
  };
  [event.sendSubmitted]: {
    /**
     * Native amount of the asset being sent.
     */
    assetAmount: string;
    /**
     * The estimated USD value of the asset being sent.
     * TODO: implement USD estimates in the Send flow.
     */
    assetAmountUSD?: string;
    /**
     * Symbol of the asset being sent.
     */
    assetSymbol?: string;
    /**
     * Human readable name of the asset being sent.
     */
    assetName?: string;
    /**
     * Contract address of the asset being sent.
     */
    assetAddress?: string;
    /**
     * `chainId` of the send transaction.
     */
    chainId: number;
  };
  [event.sendOpened]: {
    /**
     * Entrypoint of the send flow.
     */
    entryPoint:
      | 'commandk' // command k action
      | 'home_header_send_button' // Home header send button
      | 'home_shortcut_x_key' // 'X' key shortcut
      | 'token_context_menu' // Token context menu
      | 'token_details' // Token details
      | 'token_details_shortcut_x_key'; // Token details 'X' key shortcut
  };
  [event.settingsAnalyticsTrackingEnabled]: undefined;
  [event.settingsRainbowDefaultProviderDisabled]: undefined;
  [event.settingsRainbowDefaultProviderEnabled]: undefined;
  [event.swapOpened]: {
    /**
     * Entrypoint of the swaps flow.
     */
    entryPoint:
      | 'commandk' // command k action
      | 'home_header_swap_button' // Home header swap button
      | 'home_shortcut_x_key' // 'X' key shortcut
      | 'token_context_menu' // Token context menu
      | 'token_details' // Token details
      | 'token_details_shortcut_x_key'; // Token details 'X' key shortcut
  };
  [event.swapSubmitted]: {
    /**
     * Symbol of the input asset being swapped.
     */
    inputAssetSymbol: string;
    /**
     * Human readable name of the input asset being swapped.
     */
    inputAssetName: string;
    /**
     * Contract address of the input asset being swapped.
     */
    inputAssetAddress: string;
    /**
     * `chainId` of the input asset being swapped.
     */
    inputAssetChainId: number;
    /**
     * Native amount quote of input asset being swapped.
     */
    inputAssetAmount: number;
    /**
     * The estimated USD value of the input asset being swapped.
     * TODO: implement USD estimates in the Swap/Bridge flow.
     */
    inputAssetAmountUSD?: number;
    /**
     * Symbol of the destination asset.
     */
    outputAssetSymbol: string;
    /**
     * Human readbale name of the destination asset.
     */
    outputAssetName: string;
    /**
     * Contract address of the destination asset.
     */
    outputAssetAddress: string;
    /**
     * `chainId` of the destination asset.
     */
    outputAssetChainId: number;
    /**
     * Native amount quote of destination asset.
     */
    outputAssetAmount: number;
    /**
     * The estimated USD value of the destination asset.
     * TODO: implement USD estimates in the Swap/Bridge flow.
     */
    outputAssetAmountUSD?: number;
    /**
     * Whether the swap was a cross-chain swap.
     */
    crosschain: boolean;
    /**
     * The estimated USD value of the swap.
     */
    tradeAmountUSD: number;
    /**
     * Whether Degen Mode was used for the swap.
     */
    degenMode: boolean;
    /**
     * Whether a hardware wallet was used for the swap.
     */
    hardwareWallet: boolean;
  };
  [event.walletBackupQuizSubmitted]: {
    /**
     * Completed: if the user successfully completes the wallet backup quiz.
     * Failed: if the user fails to complete the backup quiz.
     * Skipped: if the user opts to skip the backup quiz completely.
     */
    status: 'completed' | 'failed' | 'skipped';
    /**
     * The entry point of the wallet backup quiz.
     */
    entryPoint: 'onboarding' | 'settings';
    /**
     * Index of the wallet seed to track how many backups are completed.
     */
    index: number;
  };
  [event.walletViewed]: undefined;
  [event.toggledDegenMode]: { enabled: boolean };
  [event.swapQuoteFailed]: {
    error_code: number | undefined;
    reason: string;
    inputAsset: { symbol: string; address: string; chainId: ChainId };
    inputAmount: string | number;
    outputAsset: { symbol: string; address: string; chainId: ChainId };
    outputAmount: string | number | undefined;
  };
  [event.tokenDetailsErc20]: {
    token: { address: string; chainId: ChainId; symbol: string };
    eventSentAfterMs: number;
    available_data: {
      chart: boolean;
      description: boolean;
      iconUrl: boolean;
      price: boolean;
    };
  };
  [event.tokenDetailsNFT]: {
    token: {
      isPoap: boolean;
      isParty: boolean;
      isENS: boolean;
      address: string;
      chainId: ChainId;
      name: string;
      image_url: string | null | undefined;
    };
    eventSentAfterMs: number;
    available_data: {
      description: boolean;
      image_url: boolean;
      floorPrice: boolean;
    };
  };
};
