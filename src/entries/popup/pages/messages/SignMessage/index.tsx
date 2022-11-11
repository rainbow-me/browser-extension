import React, { useCallback } from 'react';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows } from '~/design-system';
import { supportedChains } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { SignMessageActions } from './SignMessageActions';
import { SignMessageInfo } from './SignMessageInfo';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

export function SignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { appHost } = useAppMetadata({
    url: request?.meta?.sender?.url || '',
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedNetwork = supportedChains[appSession.chainId];
  const selectedWallet = appSession.address;

  const onAcceptRequest = useCallback(() => approveRequest(), [approveRequest]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SignMessageInfo request={request} />
      </Row>
      <Row height="content">
        <SignMessageActions
          selectedWallet={selectedWallet}
          selectedNetwork={selectedNetwork}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
