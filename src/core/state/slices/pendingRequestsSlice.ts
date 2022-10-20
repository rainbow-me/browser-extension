import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface PendingRequest {
  method: string;
  id: number;
  params: any;
}

export interface PendingRequestsSliceState {
  pendingRequests: PendingRequest | null;
  getPendingRequests: () => PendingRequest | null;
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: (id: number) => void;
}

export const pendingRequestSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  PendingRequestsSliceState
> = (set, get) => ({
  pendingRequests: null,
  getPendingRequests: () => get().pendingRequests,
  addPendingRequest: (request) =>
    set(() => ({
      pendingRequests: request,
    })),
  removePendingRequest: () =>
    set(() => ({
      pendingRequests: null,
    })),
});
