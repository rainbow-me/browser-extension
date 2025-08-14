import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';

import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { TestnetModeWatcher } from '../../components/TestnetMode/TestnetModeWatcher/TestnetModeWatcher';
import { popupClientQueryUtils } from '../../handlers/background';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { isExternalPopup } from '../../utils/windows';

import { AddEthereumChain } from './AddEthereumChain';
import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';
import { WatchAsset } from './WatchAsset';

const ApproveAppRequestWrapper = ({
  children,
  pendingRequest,
  rejectRequest,
}: {
  children: React.ReactNode;
  pendingRequest: ProviderRequestPayload;
  rejectRequest: () => void;
}) => {
  const { testnetMode } = useTestnetModeStore();
  return (
    <Box
      style={{
        marginTop: testnetMode ? -TESTNET_MODE_BAR_HEIGHT : 0,
      }}
      height="full"
    >
      {children}
      <TestnetModeWatcher
        pendingRequest={pendingRequest}
        rejectRequest={rejectRequest}
      />
    </Box>
  );
};

export const ApproveAppRequest = () => {
  const { data: pendingRequests = [], refetch: refetchPendingRequests } =
    useQuery(popupClientQueryUtils.state.requests.getAll.queryOptions());
  const { mutate: approvePendingRequest } = useMutation(
    popupClientQueryUtils.state.requests.approve.mutationOptions({
      onSuccess: () => refetchPendingRequests(),
    }),
  );
  const { mutate: rejectPendingRequest } = useMutation(
    popupClientQueryUtils.state.requests.reject.mutationOptions({
      onSuccess: () => refetchPendingRequests(),
    }),
  );
  const { notificationWindows } = useNotificationWindowStore();
  // If we're on an external popup, we only want to show the request that were sent from that tab
  // otherwise we show all the requests in the extension popup
  const filteredRequests = isExternalPopup
    ? pendingRequests.filter((request) => {
        return (
          request.meta?.sender?.tab?.id ===
          Number(window.location.search.split('tabId=')[1])
        );
      })
    : pendingRequests;

  const pendingRequest = filteredRequests?.[0];

  const navigate = useRainbowNavigate();

  useEffect(() => {
    if (pendingRequests.length < 1 && !isExternalPopup) {
      navigate(ROUTES.HOME);
    }
  }, [pendingRequests.length, navigate]);

  const handleRequestAction = useCallback(
    ({ preventWindowClose = false }: { preventWindowClose?: boolean } = {}) => {
      const notificationWindow =
        notificationWindows?.[
          Number(pendingRequest?.meta?.sender?.tab?.id)?.toString()
        ];
      console.log('pendingRequests.length', pendingRequests.length);
      if (
        !preventWindowClose &&
        pendingRequests.length <= 1 &&
        notificationWindow?.id
      ) {
        chrome.windows.remove(notificationWindow.id);
        setTimeout(() => {
          navigate(ROUTES.HOME);
        }, 50);
      }
    },
    [
      pendingRequest?.meta?.sender?.tab?.id,
      notificationWindows,
      pendingRequests.length,
      navigate,
    ],
  );

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      console.log('approveRequest', pendingRequest, payload);
      if (!pendingRequest) return;
      approvePendingRequest({ id: pendingRequest.id, payload });
      handleRequestAction();
    },
    [approvePendingRequest, handleRequestAction, pendingRequest],
  );

  const rejectRequest = useCallback(
    ({ preventWindowClose }: { preventWindowClose?: boolean } = {}) => {
      if (!pendingRequest) return;
      rejectPendingRequest({ id: pendingRequest.id });
      handleRequestAction({ preventWindowClose });
    },
    [handleRequestAction, pendingRequest, rejectPendingRequest],
  );

  switch (pendingRequest?.method) {
    case 'wallet_addEthereumChain':
      return (
        <ApproveAppRequestWrapper
          pendingRequest={pendingRequest}
          rejectRequest={rejectRequest}
        >
          <AddEthereumChain
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            request={pendingRequest}
          />
        </ApproveAppRequestWrapper>
      );
    case 'wallet_watchAsset':
      return (
        <ApproveAppRequestWrapper
          pendingRequest={pendingRequest}
          rejectRequest={rejectRequest}
        >
          <WatchAsset
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            request={pendingRequest}
          />
        </ApproveAppRequestWrapper>
      );
    case 'eth_requestAccounts':
      return (
        <ApproveAppRequestWrapper
          pendingRequest={pendingRequest}
          rejectRequest={rejectRequest}
        >
          <RequestAccounts
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            request={pendingRequest}
          />
        </ApproveAppRequestWrapper>
      );
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return (
        <ApproveAppRequestWrapper
          pendingRequest={pendingRequest}
          rejectRequest={rejectRequest}
        >
          <SignMessage
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            request={pendingRequest}
          />
        </ApproveAppRequestWrapper>
      );
    case 'eth_sendTransaction':
      return (
        <ApproveAppRequestWrapper
          pendingRequest={pendingRequest}
          rejectRequest={rejectRequest}
        >
          <SendTransaction
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            request={pendingRequest}
          />
        </ApproveAppRequestWrapper>
      );
    default:
      return null;
  }
};
