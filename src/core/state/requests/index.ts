import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import type { ProviderRequestPayload } from '../../transports/providerRequestTransport';

import { getSenderHost, getTabIdString } from './utils';

type PromiseResolver = {
  resolve: (value: object) => void;
  reject: (error: Error) => void;
};

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  connectionPromiseResolvers: Map<string, PromiseResolver[]>;
  addPendingRequest: (request: ProviderRequestPayload) => boolean;
  removePendingRequest: (id: number) => void;
  addConnectionResolver: (host: string, resolver: PromiseResolver) => void;
  resolveConnectionRequests: (
    host: string,
    result: unknown,
    isError?: boolean,
  ) => void;
}

export const usePendingRequestStore = createRainbowStore<PendingRequestsStore>(
  (set, get) => ({
    pendingRequests: [],
    connectionPromiseResolvers: new Map(),
    addPendingRequest: (newRequest) => {
      // Check for duplicate eth_requestAccounts requests from the same host
      if (newRequest.method === 'eth_requestAccounts') {
        const tabId = getTabIdString(newRequest);
        const senderHost = getSenderHost(newRequest);
        if (senderHost && tabId) {
          // Check if there's already a pending connection request for this host
          const existingConnectionRequest = get().pendingRequests.find(
            (request) => {
              if (request.method !== 'eth_requestAccounts') return false;
              const existingHost = getSenderHost(request);
              const existingTabId = getTabIdString(request);
              return existingHost === senderHost && existingTabId === tabId;
            },
          );

          if (existingConnectionRequest) {
            // Don't add duplicate - return false to indicate this is a duplicate
            return false;
          }
        }
      }

      const pendingRequests = get().pendingRequests;
      set({ pendingRequests: pendingRequests.concat([newRequest]) });
      return true;
    },
    removePendingRequest: (id) => {
      const pendingRequests = get().pendingRequests;
      set({
        pendingRequests: pendingRequests.filter((request) => request.id !== id),
      });
    },
    addConnectionResolver: (host, resolver) => {
      const resolvers = get().connectionPromiseResolvers;
      const existingResolvers = resolvers.get(host) || [];
      resolvers.set(host, [...existingResolvers, resolver]);
      set({ connectionPromiseResolvers: new Map(resolvers) });
    },
    resolveConnectionRequests: (host, result, isError = false) => {
      const resolvers = get().connectionPromiseResolvers;
      const hostResolvers = resolvers.get(host);

      if (hostResolvers) {
        hostResolvers.forEach((resolver) => {
          if (isError) {
            resolver.reject(result as Error);
          } else {
            resolver.resolve(result as object);
          }
        });

        // Clean up resolved promises
        resolvers.delete(host);
        set({ connectionPromiseResolvers: new Map(resolvers) });
      }
    },
  }),
  {
    storageKey: 'pendingRequestStore',
    version: 0,
  },
);
