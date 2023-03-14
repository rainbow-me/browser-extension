import { AnalyticsBrowser } from '@segment/analytics-next';
import { Analytics as AnalyticsNode } from '@segment/analytics-node';

import { EventProperties, event } from '~/analytics/event';
import { UserProperties } from '~/analytics/userProperties';
import { detectScriptType } from '~/core/utils/detectScriptType';
import { logger } from '~/logger';

const IS_DEV = process.env.IS_DEV === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

export class Analytics {
  client: AnalyticsBrowser | AnalyticsNode;
  deviceId?: string;
  event = event;
  disabled = false; // to do: check user setting here

  constructor() {
    /**
     * Integrations `All` key disables `amplitude-pluginsDestination` and any other
     * remote plugins that are automatically enabled in 'Device Mode'.
     * https://segment.com/docs/connections/destinations/catalog/actions-amplitude/#enable-session-tracking-for-analyticsjs-20
     * https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#analyticsjs-performance
     * https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#managing-data-flow-with-the-integrations-object
     */
    this.client =
      detectScriptType() === 'popup'
        ? AnalyticsBrowser.load(
            {
              writeKey: process.env.SEGMENT_WRITE_KEY,
            },
            { integrations: { All: false, 'Segment.io': true } },
          )
        : new AnalyticsNode({
            writeKey: process.env.SEGMENT_WRITE_KEY,
            maxEventsInBatch: 1,
          });
    logger.debug(`Segment initialized`);
  }

  /**
   * Sends an `identify` event to Segment along with the traits you pass in
   * here. This uses the `deviceId` as the identifier, and attaches the hashed
   * wallet address as a property, if available.
   */
  identify(userProperties?: UserProperties) {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const traits = { ...userProperties, ...metadata };
    this.client instanceof AnalyticsBrowser
      ? this.client.identify(this.deviceId, traits)
      : this.client.identify({ userId: this.deviceId, traits });
    logger.info('analytics.identify()', traits);
  }

  /**
   * Sends a `screen` event to Segment.
   */
  screen(routeName: string, params: Record<string, never> = {}): void {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const properties = { ...params, ...metadata };
    this.client instanceof AnalyticsBrowser
      ? this.client.screen(routeName, properties)
      : this.client.track({
          userId: this.deviceId,
          event: routeName,
          properties,
        });
    logger.info('analytics.screen()', {
      routeName,
      params,
    });
  }

  /**
   * Send an event to Segment. Param `event` must exist in
   * `~/analytics/event`, and if properties are associated with it, they must
   * be defined as part of `EventProperties` in the same file
   */
  track<T extends keyof EventProperties>(
    event: T,
    params?: EventProperties[T],
  ) {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const properties = Object.assign(metadata, params);
    this.client instanceof AnalyticsBrowser
      ? this.client.track(event, properties)
      : this.client.track({ userId: this.deviceId, event, properties });
    logger.info('analytics.track()', {
      event,
      params,
    });
  }

  /**
   * Scaffolding for Default Metadata params
   * This is used in the App for `walletAddressHash`
   */
  private getDefaultMetadata() {
    return {};
  }

  /**
   * Set `deviceId` for use as the identifier in Segment. This DOES NOT call
   * `identify()`, you must do that on your own.
   */
  setDeviceId(deviceId: string) {
    logger.debug(`Set deviceId on analytics instance`, { deviceId });
    this.deviceId = deviceId;
  }

  /**
   * Enable Segment tracking. Defaults to enabled.
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Disable Segment tracking. Defaults to enabled.
   */
  disable() {
    this.disabled = true;
  }
}

/**
 * Our core analytics tracking client. See individual methods for docs, and
 * review this directory's files for more information.
 */
export const analytics = new Analytics();
