import { useMutation } from '@tanstack/react-query';
import type { Address } from 'viem';

import { popupClientQueryUtils } from '../handlers/background';

import { useAppSessionsQuery } from './useAppSessionQuery';

export function useAppSessions() {
  const appSessions = useAppSessionsQuery();

  const addSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.addSession.mutationOptions(),
  );

  const disconnectAllSessionsMutation = useMutation(
    popupClientQueryUtils.state.sessions.disconnectAllSessions.mutationOptions(),
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
