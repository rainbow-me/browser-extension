import { uuid4 } from '@sentry/core';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface DeviceIdStore {
  deviceId: string;
}

export const useDeviceIdStore = createRainbowStore<DeviceIdStore>(
  () => ({
    deviceId: uuid4(),
  }),
  {
    storageKey: 'deviceId',
    version: 0,
  },
);
