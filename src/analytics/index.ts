import { Analytics as RudderAnalytics } from '@rudderstack/analytics-js-service-worker';

import { EventProperties, event } from '~/analytics/event';
import { UserProperties } from '~/analytics/userProperties';
import { analyticsDisabledStore } from '~/core/state/currentSettings/analyticsDisabled';
import { logger } from '~/logger';

import { version } from '../../package.json';

const IS_DEV = process.env.IS_DEV === 'true';
const IS_TESTING = process.env.IS_TESTING === 'true';

/**
 * Metadata about the current application and browser/device.
 * `context` doesn't come for free in @rudderstack/analytics-js-service-worker
 */
const context = {
  direct: true /* collect ip address for geoip */,
  app: { version },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: window?.navigator?.language,
  screen: {
    width: window?.screen.width,
    height: window?.screen.height,
    density: window?.devicePixelRatio,
  },
  userAgent: window?.navigator?.userAgent,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - userAgentData is experimental and supported in Chrome
  userAgentData: window?.navigator?.userAgentData,
};

export class Analytics {
  client?: RudderAnalytics;
  deviceId?: string;
  walletAddressHash?: string;
  walletType?: 'owned' | 'hardware' | 'watched';
  event = event;
  disabled = true; // to do: check user setting here

  constructor() {
    /**
     * Adopted `@rudderstack/analytics-js-service-worker` which mirrors
     * `@rudderstack/rudder-sdk-node` and doesn't rely on the remote fetch
     * plugin architecture as `@rudderstack/analytics-js` v3.
     * https://www.rudderstack.com/docs/sources/event-streams/sdks/rudderstack-javascript-sdk/v3/#plugins
     */

    // wait for analyticsDisabledStore to be initialized and turn it on if enabled
    setTimeout(() => {
      if (analyticsDisabledStore.getState().analyticsDisabled !== true) {
        this.disabled = false;
      }
    }, 10);

    try {
      this.client = new RudderAnalytics(
        process.env.RUDDERSTACK_WRITE_KEY,
        `${process.env.RUDDERSTACK_DATA_PLANE}/v1/batch`,
        {
          flushAt: 1,
        },
      );
      logger.debug(`RudderStack initialized`);
    } catch (e) {
      logger.debug(`RudderStack failed to initialize`);
    }
  }

  /**
   * Sends an `identify` event to RudderStack along with the traits you pass in
   * here. This uses the `deviceId` as the identifier, and attaches the hashed
   * wallet address as a property, if available.
   */
  identify(userProperties?: UserProperties) {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const traits = { ...userProperties, ...metadata };
    this.client?.identify({ userId: this.deviceId, traits, context });
    logger.info('analytics.identify()', {
      userId: this.deviceId,
      userProperties,
    });
  }

  /**
   * Sends a `screen` event to RudderStack.
   */
  screen(name: string, params: Record<string, string> = {}): void {
    if (this.disabled || IS_DEV || IS_TESTING || !this.deviceId) return;
    const metadata = this.getDefaultMetadata();
    const properties = { ...params, ...metadata };
    this.client?.screen({ userId: this.deviceId, name, properties, context });
    logger.info('analytics.screen()', {
      userId: this.deviceId,
      name,
      params,
    });
  }

  /**
   * Send an event to RudderStack. Param `event` must exist in
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
    this.client?.track({ userId: this.deviceId, event, properties, context });
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
    return {
      walletAddressHash: this.walletAddressHash,
      walletType: this.walletType,
    };
  }

  /**
   * Set `deviceId` for use as the identifier in RudderStack. This DOES NOT call
   * `identify()`, you must do that on your own.
   */
  setDeviceId(deviceId: string) {
    this.deviceId = deviceId;
    logger.debug(`Set deviceId on analytics instance`, { deviceId });
  }

  /**
   * Set `walletAddressHash` and `walletType` for use in events.
   * This DOES NOT call `identify()`, you must do that on your own.
   */
  setWallet({
    walletAddressHash,
    walletType,
  }: {
    walletAddressHash: string;
    walletType: 'owned' | 'hardware' | 'watched';
  }) {
    this.walletAddressHash = walletAddressHash;
    this.walletType = walletType;
    logger.debug(`Set walletAddressHash and walletType on analytics instance`, {
      walletAddressHash,
      walletType,
    });
  }

  /**
   * Enable RudderStack tracking. Defaults to enabled.
   */
  enable() {
    this.disabled = false;
  }

  /**
   * Disable RudderStack tracking. Defaults to enabled.
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
