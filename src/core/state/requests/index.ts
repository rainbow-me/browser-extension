import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import type { ProviderRequestPayload } from '../../transports/providerRequestTransport';

import { getSenderHost, getTabIdString } from './utils';

/**
 * Promise resolver pair for handling async connection requests.
 * Used to resolve/reject pending eth_requestAccounts requests from the same host.
 */
type PromiseResolver = {
  resolve: (value: object) => void;
  reject: (error: Error) => void;
};

export interface PendingRequestsStore {
  pendingRequests: ProviderRequestPayload[];
  /** Map of hostname to array of promise resolvers for connection requests */
  connectionPromiseResolvers: Map<string, PromiseResolver[]>;
  /** Adds a pending request, returns false if duplicate eth_requestAccounts from same host+tab */
  addPendingRequest: (request: ProviderRequestPayload) => boolean;
  removePendingRequest: (id: number) => void;
  /** Adds a resolver for connection requests from a specific host */
  addConnectionResolver: (host: string, resolver: PromiseResolver) => void;
  /** Resolves all pending connection requests for a host with the given result */
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
      // Prevent duplicate connection requests from the same host+tab.
      // This is crucial for UX as multiple eth_requestAccounts calls from the same
      // origin should unite into a single popup window, not spawn multiple.
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
      // Queue multiple connection requests from the same host to resolve together.
      // This implements the "unite connect requests" pattern where subsequent
      // eth_requestAccounts calls from the same host wait for the first one to complete.
      const resolvers = get().connectionPromiseResolvers;
      const existingResolvers = resolvers.get(host) || [];
      resolvers.set(host, [...existingResolvers, resolver]);
      set({ connectionPromiseResolvers: new Map(resolvers) });
    },
    resolveConnectionRequests: (host, result, isError = false) => {
      // Resolve all queued connection requests for this host with the same result.
      // This ensures that when a user approves/rejects a connection, all pending
      // requests from that host receive the same response.
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

        // Clean up resolved promises to prevent memory leaks
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
