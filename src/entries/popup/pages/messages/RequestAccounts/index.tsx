import React, { useCallback, useState } from 'react';
import { Address, Chain, chain } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
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

export const ApproveRequestAccounts = ({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) => {
  const { currentAddress } = useCurrentAddressStore();
  const { appHostName, appLogo, appName } = useAppMetadata({
    url: request?.meta?.sender?.url || '',
    title: request?.meta?.sender?.tab?.title,
  });
  const [selectedNetwork, setSelectedNetwork] = useState<Chain>(chain.mainnet);
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onAcceptRequest = useCallback(() => {
    approveRequest({
      address: selectedWallet,
      chainId: selectedNetwork.id,
    });
    messenger.send(`connect:${appHostName}`, {});
  }, [appHostName, approveRequest, selectedNetwork.id, selectedWallet]);

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
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={rejectRequest}
          appName={appName}
        />
      </Row>
    </Rows>
  );
};
