import { useCallback, useState } from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { initializeMessenger } from '~/core/messengers';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useAppSessionsStore, useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { getDappHostname } from '~/core/utils/connectedApps';
import { Row, Rows, Separator } from '~/design-system';
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
  const dappUrl = request?.meta?.sender?.url;
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });
  const appName =
    dappMetadata?.appName || (dappUrl ? getDappHostname(dappUrl) : '');
  const requestedChainId = (request.params?.[0] as { chainId?: string })
    ?.chainId;
  const addSession = useAppSessionsStore.use.addSession();

  const { testnetMode } = useTestnetModeStore();
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    (requestedChainId ? Number(requestedChainId) : undefined) ||
      (testnetMode ? ChainId.sepolia : ChainId.mainnet),
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);
      approveRequest({
        address: selectedWallet,
        chainId: selectedChainId,
      });
      addSession({
        host: dappMetadata?.appHost || '',
        address: selectedWallet,
        chainId: selectedChainId,
        url: dappUrl || '',
      });
      messenger.send(`connect:${dappMetadata?.appHostName}`, {
        address: selectedWallet,
        chainId: selectedChainId,
      });
      analytics.track(event.dappPromptConnectApproved, {
        chainId: selectedChainId,
        dappURL: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('error connecting to dapp');
      logger.error(new RainbowError(e.name), { message: e.message });
    } finally {
      setLoading(false);
    }
  }, [
    approveRequest,
    selectedWallet,
    selectedChainId,
    addSession,
    dappMetadata?.appHost,
    dappMetadata?.appHostName,
    dappMetadata?.appName,
    dappUrl,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    analytics.track(event.dappPromptConnectRejected, {
      chainId: selectedChainId,
      dappURL: dappMetadata?.appHost || '',
      dappName: dappMetadata?.appName,
    });
  }, [
    dappMetadata?.appHost,
    dappMetadata?.appName,
    rejectRequest,
    selectedChainId,
  ]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <RequestAccountsInfo
          appHostName={dappMetadata?.appHostName}
          appLogo={dappMetadata?.appLogo}
          appName={appName}
          dappStatus={dappMetadata?.status}
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
          dappStatus={dappMetadata?.status}
        />
      </Row>
    </Rows>
  );
};
