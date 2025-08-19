import { os } from '@orpc/server';
import z from 'zod';

import { initializeMessenger } from '~/core/messengers';
import { addressSchema } from '~/core/schemas/address';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { useAppSessionsStore } from '~/core/state/appSessions';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { toHex } from '~/core/utils/hex';

const messenger = initializeMessenger({ connect: 'inpage' });

// Schemas for type safety
const AppSessionSchema = z.object({
  activeSessionAddress: addressSchema,
  host: z.string(),
  sessions: z.record(z.string(), z.number()),
  url: z.string(),
});

const ActiveSessionSchema = z.object({
  address: addressSchema,
  chainId: z.number(),
});

const AddSessionInputSchema = z.object({
  host: z.string(),
  address: addressSchema,
  chainId: z.number(),
  url: z.string(),
});

const UpdateActiveSessionInputSchema = z.object({
  host: z.string(),
  address: addressSchema,
});

const UpdateActiveSessionChainIdInputSchema = z.object({
  host: z.string(),
  chainId: z.number(),
});

const UpdateSessionChainIdInputSchema = z.object({
  host: z.string(),
  address: addressSchema,
  chainId: z.number(),
});

const RemoveSessionInputSchema = z.object({
  host: z.string(),
  address: addressSchema,
});

const RemoveAppSessionInputSchema = z.object({
  host: z.string(),
});

const GetActiveSessionInputSchema = z.object({
  host: z.string(),
});

// Query handlers (for reactive data)
const getAppSessionsHandler = os
  .output(z.record(z.string(), AppSessionSchema))
  .handler(async () => {
    return useAppSessionsStore.getState().appSessions;
  });

const getActiveSessionHandler = os
  .input(GetActiveSessionInputSchema)
  .output(ActiveSessionSchema.nullable())
  .handler(async ({ input }) => {
    return useAppSessionsStore.getState().getActiveSession(input);
  });

// Mutation handlers (for actions)
const addSessionHandler = os
  .input(AddSessionInputSchema)
  .output(z.record(z.string(), z.number()))
  .handler(async ({ input }) => {
    const { host, address, chainId, url } = input;
    const sessions = useAppSessionsStore
      .getState()
      .addSession({ host, address, chainId, url });

    // Forward events to inpage
    messenger.send(`accountsChanged:${host}`, address);
    if (Object.keys(sessions).length === 1) {
      messenger.send(`connect:${host}`, {
        address,
        chainId: toHex(String(chainId)),
      });
    }

    return sessions;
  });

const updateActiveSessionHandler = os
  .input(UpdateActiveSessionInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { host, address } = input;
    const { appSessions, updateActiveSession } = useAppSessionsStore.getState();

    updateActiveSession({ host, address });

    // Forward events to inpage
    messenger.send(`accountsChanged:${host}`, address);
    messenger.send(`chainChanged:${host}`, appSessions[host].sessions[address]);
  });

const updateActiveSessionChainIdHandler = os
  .input(UpdateActiveSessionChainIdInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { host, chainId } = input;

    useAppSessionsStore
      .getState()
      .updateActiveSessionChainId({ host, chainId });

    // Forward events to inpage
    messenger.send(`chainChanged:${host}`, chainId);
  });

const updateSessionChainIdHandler = os
  .input(UpdateSessionChainIdInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { host, address, chainId } = input;
    const { getActiveSession, updateSessionChainId } =
      useAppSessionsStore.getState();

    updateSessionChainId({ host, address, chainId });

    // Forward events to inpage if this is the active session
    const activeSession = getActiveSession({ host });
    if (
      activeSession &&
      activeSession.address.toLowerCase() === address.toLowerCase()
    ) {
      messenger.send(`chainChanged:${host}`, chainId);
    }
  });

const removeSessionHandler = os
  .input(RemoveSessionInputSchema)
  .output(ActiveSessionSchema.nullable())
  .handler(async ({ input }) => {
    const { host, address } = input;
    const newActiveSession = useAppSessionsStore
      .getState()
      .removeSession({ host, address });

    // Clear app interaction state
    useAppConnectionWalletSwitcherStore
      .getState()
      .clearAppHasInteractedWithNudgeSheet({ host });

    // Forward events to inpage
    if (newActiveSession) {
      messenger.send(`accountsChanged:${host}`, newActiveSession.address);
      messenger.send(`chainChanged:${host}`, newActiveSession.chainId);
    } else {
      messenger.send(`disconnect:${host}`, []);
    }

    return newActiveSession;
  });

const removeAppSessionHandler = os
  .input(RemoveAppSessionInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { host } = input;

    useAppSessionsStore.getState().removeAppSession({ host });
    useAppConnectionWalletSwitcherStore
      .getState()
      .clearAppHasInteractedWithNudgeSheet({ host });

    // Forward events to inpage
    messenger.send(`disconnect:${host}`, null);
  });

const removeAddressSessionsHandler = os
  .input(z.object({ address: addressSchema }))
  .output(z.void())
  .handler(async ({ input }) => {
    const { address } = input;
    useAppSessionsStore.getState().removeAddressSessions({ address });
  });

const disconnectAllSessionsHandler = os.output(z.void()).handler(async () => {
  const { appSessions, clearSessions } = useAppSessionsStore.getState();

  // Disconnect all sessions and forward events
  Object.values(appSessions).forEach((session) => {
    useAppConnectionWalletSwitcherStore
      .getState()
      .clearAppHasInteractedWithNudgeSheet({
        host: session.host,
      });

    if (isValidUrl(session?.url)) {
      messenger.send(`disconnect:${getDappHost(session.url)}`, null);
    }
  });

  clearSessions();
});

export const sessionsRouter = {
  // Queries
  getAppSessions: getAppSessionsHandler,
  getActiveSession: getActiveSessionHandler,

  // Mutations
  addSession: addSessionHandler,
  updateActiveSession: updateActiveSessionHandler,
  updateActiveSessionChainId: updateActiveSessionChainIdHandler,
  updateSessionChainId: updateSessionChainIdHandler,
  removeSession: removeSessionHandler,
  removeAppSession: removeAppSessionHandler,
  removeAddressSessions: removeAddressSessionsHandler,
  disconnectAllSessions: disconnectAllSessionsHandler,
};
