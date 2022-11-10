import React from 'react';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows } from '~/design-system';
import { supportedChains } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

import { useAppSession } from '../../hooks/useAppSession';

import { SignBottomButtons } from './BottomButtons/SignBottomButtons';
import { SignInfo } from './RequestInfo/SignInfo';

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

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <SignInfo request={request} />
      </Row>
      <Row height="content">
        <SignBottomButtons
          selectedWallet={selectedWallet}
          selectedNetwork={selectedNetwork}
          onApproveRequest={approveRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
