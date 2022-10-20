import create from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import {
  CurrentAddressSliceState,
  currentAddressSlice,
} from './slices/currentAddressSlice';
import {
  pendingRequestSlice,
  PendingRequestsSliceState,
} from './slices/pendingRequestsSlice';
import {
  notificationWindowSlice,
  NotificationWindowsSliceState,
} from './slices/notificationWindowSlice';
import {
  approvedHostsSlice,
  ApprovedHostsSliceState,
} from './slices/approvedHostsSlice';

export type BackgroundStoreState = CurrentAddressSliceState &
  PendingRequestsSliceState &
  NotificationWindowsSliceState &
  ApprovedHostsSliceState;

// The backgroundStore instance is to be used exclusively for global state that
// is needed in the background, content, inpage contexts of the app
// This store should not be used for senstive data as the popup.ts context
// can subscribe to the data using the backgroundStoreTransport
export const backgroundStore = create<BackgroundStoreState>()(
  persist(
    (...props) => ({
      ...currentAddressSlice(...props),
      ...pendingRequestSlice(...props),
      ...notificationWindowSlice(...props),
      ...approvedHostsSlice(...props),
    }),
    { name: 'store:background', getStorage: () => persistStorage },
  ),
);
