import { useCallback, useState } from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getWalletContext } from '~/analytics/util';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { getDappHostname } from '~/core/utils/connectedApps';
import { Row, Rows, Separator } from '~/design-system';
import { useAppSessions } from '~/entries/popup/hooks/useAppSessions';
import { RainbowError, logger } from '~/logger';

import { RequestAccountsActions } from './RequestAccountsActions';
import { RequestAccountsInfo } from './RequestAccountsInfo';

interface ApproveRequestProps {
  approveRequest: (payload: { address: Address; chainId: number }) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export const RequestAccounts = ({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) => {
  const [loading, setLoading] = useState(false);
  const [currentAddress] = useSettingsStore('currentAddress');
  const dappUrl = request?.meta?.sender?.url;
  const { addSession } = useAppSessions();
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });
  const appName =
    dappMetadata?.appName || (dappUrl ? getDappHostname(dappUrl) : '');
  const requestedChainId = (request.params?.[0] as { chainId?: string })
    ?.chainId;
  const [testnetMode] = useSettingsStore('isTestnetMode');
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    (requestedChainId ? Number(requestedChainId) : undefined) ||
      (testnetMode ? ChainId.sepolia : ChainId.mainnet),
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onAcceptRequest = useCallback(async () => {
    try {
      setLoading(true);
      approveRequest({
        address: selectedWallet,
        chainId: selectedChainId,
      });
      // Session actions now handle both state management and inpage messaging
      await addSession({
        host: dappMetadata?.appHost || '',
        address: selectedWallet,
        chainId: selectedChainId,
        url: dappUrl || '',
      });
      analytics.track(
        event.dappPromptConnectApproved,
        {
          chainId: selectedChainId,
          dappURL: dappMetadata?.url || '',
          dappDomain: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        },
        await getWalletContext(selectedWallet),
      );
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
    dappMetadata?.url,
    dappMetadata?.appName,
    dappUrl,
  ]);

  const onRejectRequest = useCallback(async () => {
    rejectRequest();
    analytics.track(
      event.dappPromptConnectRejected,
      {
        chainId: selectedChainId,
        dappURL: dappMetadata?.url || '',
        dappDomain: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      },
      await getWalletContext(selectedWallet),
    );
  }, [
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    rejectRequest,
    selectedChainId,
    selectedWallet,
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
