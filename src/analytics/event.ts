/**
 * All events, used by `analytics.track()`
 */
export const event = {
  /**
   * Called when the popup is opened.
   */
  open: 'open',
  /**
   * Called when user disables tracking in Settings.
   */
  analyticsTrackingDisabled: 'analytics_tracking.disabled',
  /**
   * Called when user enables tracking in Settings.
   */
  analyticsTrackingEnabled: 'analytics_tracking.enabled',
} as const;

/**
 * Properties corresponding to each event
 */
export type EventProperties = {
  [event.open]: undefined;
  [event.analyticsTrackingDisabled]: undefined;
  [event.analyticsTrackingEnabled]: undefined;
};
