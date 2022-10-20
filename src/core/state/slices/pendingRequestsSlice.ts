import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface PendingRequest {
  method: string;
  id: number;
  params: {
    id: number;
    method: string;
  };
}

export interface PendingRequestsSliceState {
  pendingRequest: PendingRequest | null;
  getPendingRequest: () => PendingRequest | null;
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: () => void;
}

export const pendingRequestSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  PendingRequestsSliceState
> = (set, get) => ({
  pendingRequest: null,
  getPendingRequest: () => get().pendingRequest,
  addPendingRequest: (request) =>
    set(() => ({
      pendingRequest: request,
    })),
  removePendingRequest: () =>
    set(() => ({
      pendingRequest: null,
    })),
});
