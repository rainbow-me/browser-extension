import mitt from 'mitt';
import { createBaseStore } from 'stores';

import { onlyBackground } from '~/core/utils/onlyBackground';

import { ProviderRequestPayload } from '../../transports/providerRequestTransport';
import { createExtensionStoreOptions } from '../_internal';

type Responses =
  | { status: 'APPROVED'; payload: unknown }
  | { status: 'REJECTED'; payload: null };

// New Events type: event name is the request id (number), value is 'APPROVED' | 'REJECTED'
type Events = {
  [id: number]: Responses;
};

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  addPendingRequest: (request: ProviderRequestPayload) => void;
  approvePendingRequest: (id: number, payload: unknown) => void;
  rejectPendingRequest: (id: number) => void;
  waitForPendingRequest: (id: number) => Promise<Responses>;
}

const eventEmitter = mitt<Events>();

export const usePendingRequestStore = createBaseStore<PendingRequestsStore>(
  (set, get) => ({
    pendingRequests: [],
    addPendingRequest: (newRequest) => {
      onlyBackground('usePendingRequestStore.addPendingRequest()');

      const pendingRequests = get().pendingRequests;
      set({ pendingRequests: [...pendingRequests, newRequest] });
    },
    approvePendingRequest: (id, payload) => {
      onlyBackground('usePendingRequestStore.approvePendingRequest()');

      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
      eventEmitter.emit(id, { status: 'APPROVED', payload });
    },
    rejectPendingRequest: (id) => {
      onlyBackground('usePendingRequestStore.rejectPendingRequest()');

      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
      eventEmitter.emit(id, { status: 'REJECTED', payload: null });
    },
    waitForPendingRequest: (id: number): Promise<Responses> => {
      onlyBackground('usePendingRequestStore.waitForPendingRequest()');

      return new Promise((resolve) => {
        const handler = (status: Responses) => {
          eventEmitter.off(id, handler);
          resolve(status);
        };
        eventEmitter.on(id, handler);
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'pendingRequestStore',
    version: 0,
  }),
);
