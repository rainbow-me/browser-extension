import { uuid4 } from '@sentry/utils';
import React, { useCallback, useMemo } from 'react';
import { chain, useNetwork } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { WalletActions } from '~/core/types/walletActions';
import { getRequestDisplayDetails } from '~/core/utils/signMessages';
import { Row, Rows } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { SignMessageActions } from './SignMessageActions';
import { SignMessageInfo } from './SignMessageInfo';

interface ApproveRequestProps {
  approveRequest: (payload: unknown) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}
const backgroundMessenger = initializeMessenger({ connect: 'background' });

export function SignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { appHost } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });
  const { chains } = useNetwork();

  const selectedNetwork =
    chains.find(({ id }) => id === appSession.chainId) ?? chain.mainnet;
  const selectedWallet = appSession.address;

  const action = useMemo(() => {
    switch (request.method) {
      case 'eth_sign':
      case 'personal_sign':
        return WalletActions.sign_message;
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return WalletActions.sign_typed_data;
    }
  }, [request.method]);

  const onAcceptRequest = useCallback(async () => {
    const { result }: { result: unknown } = await backgroundMessenger.send(
      WalletActions.action,
      {
        action,
        payload: getRequestDisplayDetails(request),
      },
      { id: uuid4() },
    );
    approveRequest(result);
  }, [action, approveRequest, request]);

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
