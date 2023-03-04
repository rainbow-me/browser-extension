import React, { useCallback, useState } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { RPCMethod } from '~/core/types/rpcMethods';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import * as wallet from '../../../handlers/wallet';

import { SignMessageActions } from './SignMessageActions';
import { SignMessageInfo } from './SignMessageInfo';

interface ApproveRequestProps {
  approveRequest: (payload: unknown) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

const getWalletActionMethod = (
  method: RPCMethod,
): 'personal_sign' | 'sign_typed_data' | undefined => {
  switch (method) {
    case 'eth_sign':
    case 'personal_sign':
      return 'personal_sign';
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return 'sign_typed_data';
  }
};

export function SignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const { appHost, appName } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });

  const selectedChainId = appSession.chainId ?? ChainId.mainnet;
  const selectedWallet = appSession.address;

  const onAcceptRequest = useCallback(async () => {
    const walletAction = getWalletActionMethod(request?.method);
    const requestPayload = getSigningRequestDisplayDetails(request);
    const { type } = await wallet.getWallet(selectedWallet);
    if (!requestPayload.msgData || !requestPayload.address) return;
    let result = null;

    // Change the label while we wait for confirmation
    if (type === 'HardwareWalletKeychain') {
      setWaitingForDevice(true);
    }

    if (walletAction === 'personal_sign') {
      result = await wallet.personalSign(
        requestPayload.msgData,
        requestPayload.address,
      );
      analytics.track(event.dappPromptSignMessageApproved, {
        dappURL: appHost,
        dappName: appName,
      });
    } else if (walletAction === 'sign_typed_data') {
      result = await wallet.signTypedData(
        requestPayload.msgData,
        requestPayload.address,
      );
      analytics.track(event.dappPromptSignTypedDataApproved, {
        dappURL: appHost,
        dappName: appName,
      });
    }
    approveRequest(result);
    setWaitingForDevice(false);
  }, [appHost, appName, approveRequest, request, selectedWallet]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    const walletAction = getWalletActionMethod(request?.method);
    if (walletAction === 'personal_sign') {
      analytics.track(event.dappPromptSignMessageRejected, {
        dappURL: appHost,
        dappName: appName,
      });
    } else if (walletAction === 'sign_typed_data') {
      analytics.track(event.dappPromptSignTypedDataRejected, {
        dappURL: appHost,
        dappName: appName,
      });
    }
  }, [appHost, appName, rejectRequest, request]);

  return (
    <Box style={{ overflowY: 'hidden' }} width="full" height="full">
      <SignMessageInfo request={request} />
      <SignMessageActions
        waitingForDevice={waitingForDevice}
        selectedWallet={selectedWallet}
        selectedChainId={selectedChainId}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
      />
    </Box>
  );
}
