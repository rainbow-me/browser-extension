/* eslint sort-keys: "error"*/

import { Address } from 'wagmi';

import { KeyboardEventDescription } from '~/entries/popup/hooks/useKeyboardAnalytics';

import { screen } from './screen';

/**
 * All events, used by `analytics.track()`
 */
export const event = {
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
   * Called when user disables global Flashbots setting in Settings.
   */
  settingsFlashbotsDisabled: 'settings.flashbots.disabled',
  /**
   * Called when user enables global Flashbots setting in Settings.
   */
  settingsFlashbotsEnabled: 'settings.flashbots.enabled',
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
   * Called when the user completes a Swap/Bridge and submits the transaction.
   * This includes cross-chain swaps, while `bridgeSubmitted` is instead called
   * for mapped asset bridge transactions where the `mainnetAddress` is equal.
   */
  swapSubmitted: 'swap.submitted',
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
     * Whether Flashbots was used for the swap.
     */
    flashbots: boolean;
    /**
     * The estimated USD value of the swap.
     */
    tradeAmountUSD: number;
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
     * Full url of the dApp requesting a sign message request.
     */
    dappURL: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignMessageRejected]: {
    /**
     * Full url of the dApp requesting a sign message request.
     */
    dappURL: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignTypedDataApproved]: {
    /**
     * Full url of the dApp requesting a sign typed data request.
     */
    dappURL: string;
    /**
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
  };
  [event.dappPromptSignTypedDataRejected]: {
    /**
     * Full url of the dApp requesting a sign typed data request.
     */
    dappURL: string;
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
     * Short name of the dApp displayed to the user.
     */
    dappName?: string;
    /**
     * `chainId` of the network the dApp requested a switch to.
     */
    chainId: number;
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
  [event.settingsAnalyticsTrackingEnabled]: undefined;
  [event.settingsRainbowDefaultProviderDisabled]: undefined;
  [event.settingsRainbowDefaultProviderEnabled]: undefined;
  [event.settingsFlashbotsDisabled]: undefined;
  [event.settingsFlashbotsEnabled]: undefined;
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
     * Whether Flashbots was used for the swap.
     */
    flashbots: boolean;
    /**
     * The estimated USD value of the swap.
     */
    tradeAmountUSD: number;
  };
  [event.walletViewed]: undefined;
};
