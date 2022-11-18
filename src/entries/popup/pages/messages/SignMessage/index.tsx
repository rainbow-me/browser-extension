import React, { useCallback } from 'react';
import { chain, useNetwork } from 'wagmi';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { RPCMethod } from '~/core/types/rpcMethods';
import { WalletActions } from '~/core/types/walletActions';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Row, Rows } from '~/design-system';
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
): WalletActions.personal_sign | WalletActions.sign_typed_data | undefined => {
  switch (method) {
    case 'eth_sign':
    case 'personal_sign':
      return WalletActions.personal_sign;
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return WalletActions.sign_typed_data;
  }
};

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

  const onAcceptRequest = useCallback(async () => {
    const walletAction = getWalletActionMethod(request?.method);
    const requestPayload = getSigningRequestDisplayDetails(request);
    if (!requestPayload) return;
    let result = null;
    if (walletAction === WalletActions.personal_sign) {
      result = await wallet.personalSign(
        requestPayload.msgData,
        requestPayload.address,
      );
    } else if (walletAction === WalletActions.sign_typed_data) {
      result = await wallet.signTypedData(
        requestPayload.msgData,
        requestPayload.address,
      );
    }
    approveRequest(result);
  }, [approveRequest, request]);

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
