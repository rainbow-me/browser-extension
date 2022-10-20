import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface PendingRequest {
  method: string;
  id: number;
  params?: unknown[];
}

export interface PendingRequestsSliceState {
  pendingRequest: PendingRequest | null;
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: () => void;
}

export const pendingRequestSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  PendingRequestsSliceState
> = (set) => ({
  pendingRequest: null,
  addPendingRequest: (request) =>
    set(() => ({
      pendingRequest: request,
    })),
  removePendingRequest: () =>
    set(() => ({
      pendingRequest: null,
    })),
});
