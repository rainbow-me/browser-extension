import { uuid4 } from '@sentry/utils';
import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface DeviceIdStore {
  deviceId: string;
  setDeviceId: (deviceId: string) => void;
}

export const deviceIdStore = createStore<DeviceIdStore>(
  (set) => ({
    deviceId: uuid4(),
    setDeviceId: (newDeviceId) => set({ deviceId: newDeviceId }),
  }),
  {
    persist: {
      name: 'deviceId',
      version: 0,
    },
  },
);

export const useDeviceIdStore = create(deviceIdStore);
