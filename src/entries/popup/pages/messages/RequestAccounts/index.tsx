import React, { useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { initializeMessenger } from '~/core/messengers';
import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { Row, Rows, Separator } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { RainbowError, logger } from '~/logger';

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
  const [loading, setLoading] = useState(false);
  const { currentAddress } = useCurrentAddressStore();
  const { appHostName, appHost, appLogo, appName } = useAppMetadata({
    url: request?.meta?.sender?.url,
    title: request?.meta?.sender?.tab?.title,
  });
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    ChainId.mainnet,
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);
      approveRequest({
        address: selectedWallet,
        chainId: selectedChainId,
      });
      messenger.send(`connect:${appHostName}`, {
        address: selectedWallet,
        chainId: selectedChainId,
      });
      analytics.track(event.dappPromptConnectApproved, {
        chainId: selectedChainId,
        dappURL: appHost,
        dappName: appName,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('error connecting to dapp');
      logger.error(new RainbowError(e.name), { message: e.message });
    } finally {
      setLoading(false);
    }
  }, [
    appHostName,
    appHost,
    appName,
    approveRequest,
    selectedChainId,
    selectedWallet,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    analytics.track(event.dappPromptConnectRejected, {
      chainId: selectedChainId,
      dappURL: appHost,
      dappName: appName,
    });
  }, [appHost, appName, rejectRequest, selectedChainId]);

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
          onRejectRequest={onRejectRequest}
          appName={appName}
          loading={loading}
        />
      </Row>
    </Rows>
  );
};
