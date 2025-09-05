import { useMutation } from '@tanstack/react-query';
import { Address } from 'viem';

import { popupClientQueryUtils } from '~/entries/popup/handlers/background';

import {
  useActiveSessionQuery,
  useAppSessionQuery,
} from './useAppSessionQuery';

export function useAppSession({ host = '' }: { host?: string }) {
  const activeSession = useActiveSessionQuery(host);
  const appSession = useAppSessionQuery(host);

  // Mutations that invalidate queries
  const updateActiveSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateActiveSession.mutationOptions(),
  );

  const updateActiveSessionChainIdMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateActiveSessionChainId.mutationOptions(),
  );

  const updateSessionChainIdMutation = useMutation(
    popupClientQueryUtils.state.sessions.updateSessionChainId.mutationOptions(),
  );

  const removeSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.removeSession.mutationOptions(),
  );

  const removeAppSessionMutation = useMutation(
    popupClientQueryUtils.state.sessions.removeAppSession.mutationOptions(),
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
    appSession,
    activeSession,
  };
}
