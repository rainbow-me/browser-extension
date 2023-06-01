import { Analytics as AnalyticsNode } from '@segment/analytics-node';

import { EventProperties, event } from '~/analytics/event';
import { UserProperties } from '~/analytics/userProperties';
import { analyticsDisabledStore } from '~/core/state/currentSettings/analyticsDisabled';
import { RainbowError, logger } from '~/logger';

const IS_DEV = process.env.IS_DEV === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

export class Analytics {
  client?: AnalyticsNode;
  deviceId?: string;
  event = event;
  disabled = true; // to do: check user setting here

  constructor() {
    /**
     * Using @segment/analytics-node beta because analytics-node is deprecated.
     * https://github.com/segmentio/analytics-next/tree/master/packages/node#readme
     * @segment/analytics-next relies on a remote fetch plugin architecture
     * that isn't viable in manifest v3 and extensions are not officially supported:
     * - When connected to Analytics.js 2.0 source, we load a light-weight plugin on the
     *   webpage for session tracking and enrichment as an alternative to Amplitude SDK.
     * - We do not provide a way to disable loading the session plugin for Amplitude at
     *   the moment, unfortunately. With that said, I have logged this as a feature request
     * - We do not formally support loading Segment, including our Analytics.js library, within
     *   Chrome extensions. There have been stories of people getting this working, but it's not
     *   something we would be able to support, although you can go ahead and give it a try.
     */

    // wait for analyticsDisabledStore to be initialized and turn it on if enabled
    setTimeout(() => {
      if (analyticsDisabledStore.getState().analyticsDisabled !== true) {
        this.disabled = false;
      }
    }, 10);

    try {
      this.client = new AnalyticsNode({
        maxEventsInBatch: 1 /* replicate analytics-next flushing behavior */,
        writeKey: process.env.SEGMENT_WRITE_KEY,
      }).on('error', ({ code, reason }) =>
        logger.error(new RainbowError('Segment error'), { code, reason }),
      );
      logger.debug(`Segment initialized`);
    } catch (e) {
      logger.debug(`Segment failed to initialize`);
    }
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
    this.client?.identify({ userId: this.deviceId, traits });
    logger.info('analytics.identify()', {
      userId: this.deviceId,
      userProperties,
    });
  }

  /**
   * Sends a `screen` event to Segment.
   */
  screen(name: string, params: Record<string, string> = {}): void {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const properties = { ...params, ...metadata };
    this.client?.screen({ userId: this.deviceId, name, properties });
    logger.info('analytics.screen()', {
      userId: this.deviceId,
      name,
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
    this.client?.track({ userId: this.deviceId, event, properties });
    logger.info('analytics.track()', {
      userId: this.deviceId,
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
    this.deviceId = deviceId;
    logger.debug(`Set deviceId on analytics instance`, { deviceId });
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
