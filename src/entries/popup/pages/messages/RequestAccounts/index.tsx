import React, { useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { Row, Rows, Separator } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

import { RequestAccountsActions } from './RequestAccountsActions';
import { RequestAccountsInfo } from './RequestAccountsInfo';

interface ApproveRequestProps {
  approveRequest: (payload: { address: Address; chainId: number }) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

const messenger = initializeMessenger({ connect: 'inpage' });

export const RequestAccounts = ({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) => {
  const { currentAddress } = useCurrentAddressStore();
  const { appHostName, appLogo, appName } = useAppMetadata({
    url: request?.meta?.sender?.url,
    title: request?.meta?.sender?.tab?.title,
  });
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    ChainId.mainnet,
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onAcceptRequest = useCallback(() => {
    approveRequest({
      address: selectedWallet,
      chainId: selectedChainId,
    });
    messenger.send(`connect:${appHostName}`, {
      address: selectedWallet,
      chainId: selectedChainId,
    });
  }, [appHostName, approveRequest, selectedChainId, selectedWallet]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <RequestAccountsInfo
          appHostName={appHostName}
          appLogo={appLogo}
          appName={appName}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <RequestAccountsActions
          selectedWallet={selectedWallet}
          setSelectedWallet={setSelectedWallet}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
          appName={appName}
        />
      </Row>
    </Rows>
  );
};
