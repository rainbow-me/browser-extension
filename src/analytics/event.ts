/* eslint sort-keys: "error"*/

/**
 * All events, used by `analytics.track()`
 */
export const event = {
  /**
   * Called when the dApp requests a network change and the extension
   * auto-approves the request and displays a notification in the DOM.
   */
  dappNotificationNetworkSwitched: 'dapp.notification.network_switched',
  /**
   * Called when the user approves a connection request from the active dApp.
   */
  dappPromptConnectApproved: 'dapp.prompt.connect.approved',
  /**
   * Called when the user switches networks from the dApp Connect prompt.
   */
  dappPromptConnectNetworkSwitched: 'dapp.prompt.connect.network_switched',
  /**
   * Called when the user rejects a connection request
   * with the Cancel button in the dApp Connect prompt.
   */
  dappPromptConnectRejected: 'dapp.prompt.connect.rejected',
  /**
   * Called when the user switches wallets from the dApp Connect prompt.
   */
  dappPromptConnectWalletSwitched: 'dapp.prompt.connect.wallet_switched',
  /**
   * Called when the user disconnects the extension from the dApp with a `disconnect` event.
   */
  dappProviderDisconnected: 'dapp.provider.disconnected',
  /**
   * Called when the user switches networks from the dApp with a `switchNetwork` event.
   */
  dappProviderNetworkSwitched: 'dapp.provider.network_switched',
  /**
   * Called when the popup entry is opened, including:
   * - extension popup
   * - new window
   * - onboarding or welcome page
   */
  popupOpened: 'popup.opened',
  /**
   * Called when user disables tracking in Settings.
   */
  settingsAnalyticsTrackingDisabled: 'settings.analytics_tracking.disabled',
  /**
   * Called when user enables tracking in Settings.
   */
  settingsAnalyticsTrackingEnabled: 'settings.analytics_tracking.enabled',
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
  [event.dappNotificationNetworkSwitched]: {
    /**
     * `chainId` of the network the dApp requested a switch to.
     */
    chainId: number;
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
    dappName: string;
  };
  [event.dappPromptConnectNetworkSwitched]: {
    /**
     * `chainId` of the network the user selected in the prompt.
     */
    chainId: number;
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
    dappName: string;
  };
  [event.dappPromptConnectWalletSwitched]: undefined;
  [event.popupOpened]: undefined;
  [event.settingsAnalyticsTrackingDisabled]: undefined;
  [event.settingsAnalyticsTrackingEnabled]: undefined;
  [event.walletViewed]: undefined;
};
