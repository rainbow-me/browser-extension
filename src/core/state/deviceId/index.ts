import { uuid4 } from '@sentry/core';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface DeviceIdStore {
  deviceId: string;
  setDeviceId: (deviceId: string) => void;
}

export const useDeviceIdStore = createRainbowStore<DeviceIdStore>(
  (set) => ({
    deviceId: uuid4(),
    setDeviceId: (newDeviceId) => set({ deviceId: newDeviceId }),
  }),
  {
    storageKey: 'deviceId',
    version: 0,
  },
);
