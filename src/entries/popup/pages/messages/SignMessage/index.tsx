import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { RPCMethod } from '~/core/types/rpcMethods';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { RainbowError, logger } from '~/logger';

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
  const [loading, setLoading] = useState(false);
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const { watchedWallets } = useWallets();

  const selectedChainId = activeSession?.chainId ?? ChainId.mainnet;
  const selectedWallet = activeSession?.address;

  const onAcceptRequest = useCallback(async () => {
    const walletAction = getWalletActionMethod(request?.method);
    const requestPayload = getSigningRequestDisplayDetails(request);
    if (!requestPayload.msgData || !requestPayload.address || !selectedWallet)
      return;
    const { type } = await wallet.getWallet(selectedWallet);
    let result = null;

    setLoading(true);
    try {
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
          dappURL: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        });
      } else if (walletAction === 'sign_typed_data') {
        result = await wallet.signTypedData(
          requestPayload.msgData,
          requestPayload.address,
        );
        analytics.track(event.dappPromptSignTypedDataApproved, {
          dappURL: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        });
      }
      approveRequest(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      showLedgerDisconnectedAlertIfNeeded(e);
      logger.info('error in sign message');
      logger.error(new RainbowError(e.name), { message: e.message });
    } finally {
      setWaitingForDevice(false);
      setLoading(false);
    }
  }, [
    approveRequest,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    request,
    selectedWallet,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    const walletAction = getWalletActionMethod(request?.method);
    if (walletAction === 'personal_sign') {
      analytics.track(event.dappPromptSignMessageRejected, {
        dappURL: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });
    } else if (walletAction === 'sign_typed_data') {
      analytics.track(event.dappPromptSignTypedDataRejected, {
        dappURL: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });
    }
  }, [
    dappMetadata?.appHost,
    dappMetadata?.appName,
    rejectRequest,
    request?.method,
  ]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  useEffect(() => {
    if (isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [isWatchingWallet, rejectRequest]);

  return (
    <Box style={{ overflowY: 'hidden' }} width="full" height="full">
      <SignMessageInfo request={request} />
      <SignMessageActions
        waitingForDevice={waitingForDevice}
        selectedWallet={selectedWallet || ('' as Address)}
        selectedChainId={selectedChainId}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
        loading={loading}
        dappStatus={dappMetadata?.status}
      />
    </Box>
  );
}
