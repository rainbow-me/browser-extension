/**
 * All events, used by `analytics.track()`
 */
export const event = {
  /**
   * Called when the popup entry is opened, including:
   * - extension popup
   * - new window
   * - onboarding or welcome page
   */
  popupOpened: 'popup.opened',
  /**
   * Called when the core wallet Tokens & Activity
   * screen is viewed or opened in the extension popup.
   */
  walletViewed: 'wallet.viewed',
  /**
   * Called when user disables tracking in Settings.
   */
  settingsAnalyticsTrackingDisabled: 'settings.analytics_tracking.disabled',
  /**
   * Called when user enables tracking in Settings.
   */
  settingsAnalyticsTrackingEnabled: 'settings.analytics_tracking.enabled',
} as const;

/**
 * Properties corresponding to each event
 */
export type EventProperties = {
  [event.popupOpened]: undefined;
  [event.walletViewed]: undefined;
  [event.settingsAnalyticsTrackingDisabled]: undefined;
  [event.settingsAnalyticsTrackingEnabled]: undefined;
};
