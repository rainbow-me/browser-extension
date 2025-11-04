import { uuid4 } from '@sentry/core';
import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface DeviceIdStore {
  deviceId: string;
}

export const useDeviceIdStore = createBaseStore<DeviceIdStore>(
  () => ({
    deviceId: uuid4(),
  }),
  createExtensionStoreOptions({
    storageKey: 'deviceId',
    version: 0,
  }),
);
