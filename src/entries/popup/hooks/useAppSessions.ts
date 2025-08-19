import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Address } from 'viem';

import { popupClientQueryUtils } from '../handlers/background';

import { useAppSessionsQuery } from './useAppSessionQuery';

export function useAppSessions() {
  const queryClient = useQueryClient();
  const { data: appSessions = {} } = useAppSessionsQuery();

  // Helper to invalidate both queries
  const invalidateSessionQueries = () => {
    queryClient.invalidateQueries({
      queryKey: popupClientQueryUtils.state.sessions.getAppSessions.key(),
    });
    queryClient.invalidateQueries({
      queryKey: popupClientQueryUtils.state.sessions.getActiveSession.key(),
    });
  };

  const addSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.addSession.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  const disconnectAllSessionsMutation = useMutation(
    popupClientQueryUtils.state.sessions.disconnectAllSessions.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  // Wrapper functions to maintain the same API
  const addSession = ({
    host,
    address,
    chainId,
    url,
  }: {
    host: string;
    address: Address;
    chainId: number;
    url: string;
  }) => {
    return addSessionMutation.mutateAsync({ host, address, chainId, url });
  };

  const disconnectAppSessions = () => {
    return disconnectAllSessionsMutation.mutate({});
  };

  return {
    appSessions,
    addSession,
    disconnectAppSessions,
  };
}
