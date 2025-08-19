import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';

import { popupClientQueryUtils } from '~/entries/popup/handlers/background';

import {
  useActiveSessionQuery,
  useAppSessionQuery,
} from './useAppSessionQuery';

export function useAppSession({ host = '' }: { host?: string }) {
  const queryClient = useQueryClient();
  const { data: activeSession = null } = useActiveSessionQuery(host);
  const appSession = useAppSessionQuery(host);

  // Provide a default structure when loading to maintain backward compatibility
  const defaultAppSession = {
    activeSessionAddress:
      '0x0000000000000000000000000000000000000000' as Address,
    host: host || '',
    sessions: {} as Record<Address, number>,
    url: '',
  };

  const safeAppSession = appSession ?? defaultAppSession;

  // Helper to invalidate both queries
  const invalidateSessionQueries = () => {
    queryClient.invalidateQueries({
      queryKey: popupClientQueryUtils.state.sessions.getAppSessions.key(),
    });
    queryClient.invalidateQueries({
      queryKey: popupClientQueryUtils.state.sessions.getActiveSession.key(),
    });
  };

  // Mutations that invalidate queries
  const updateActiveSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateActiveSession.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  const updateActiveSessionChainIdMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateActiveSessionChainId.mutationOptions(
      {
        onSuccess: invalidateSessionQueries,
      },
    ),
  );

  const updateSessionChainIdMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateSessionChainId.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  const removeSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.removeSession.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  const removeAppSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.removeAppSession.mutationOptions({
      onSuccess: invalidateSessionQueries,
    }),
  );

  const updateAppSessionAddress = ({ address }: { address: Address }) => {
    return updateActiveSessionMutation.mutateAsync({ host, address });
  };

  const updateAppSessionChainId = (chainId: number) => {
    return updateActiveSessionChainIdMutation.mutateAsync({ host, chainId });
  };

  const updateSessionChainId = ({
    address,
    chainId,
  }: {
    address: Address;
    chainId: number;
  }) => {
    return updateSessionChainIdMutation.mutateAsync({ host, address, chainId });
  };

  const disconnectSession = ({
    address,
    host,
  }: {
    address: Address;
    host: string;
  }) => {
    return removeSessionMutation.mutateAsync({ host, address });
  };

  const disconnectAppSession = () => {
    return removeAppSessionMutation.mutateAsync({ host });
  };

  return {
    updateAppSessionAddress,
    updateSessionChainId,
    updateAppSessionChainId,
    disconnectAppSession,
    disconnectSession,
    appSession: safeAppSession,
    activeSession,
  };
}
