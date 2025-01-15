import { useCallback, useEffect, useMemo, useState } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getWalletContext } from '~/analytics/util';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { RPCMethod } from '~/core/types/rpcMethods';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { Bleed, Box, Stack } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { showLedgerDisconnectedAlertIfNeeded } from '~/entries/popup/handlers/ledger';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { RainbowError, logger } from '~/logger';

import * as wallet from '../../../handlers/wallet';
import { AccountSigningWith } from '../AccountSigningWith';

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
  const { featureFlags } = useFeatureFlagsStore();
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const { allWallets, watchedWallets } = useWallets();

  const selectedWallet = activeSession?.address;

  const onAcceptRequest = useCallback(async () => {
    const walletAction = getWalletActionMethod(request?.method);
    const requestPayload = getSigningRequestDisplayDetails(request);
    if (!requestPayload.msgData || !requestPayload.address || !selectedWallet)
      return;
    const { type, vendor } = await wallet.getWallet(selectedWallet);
    let result = null;

    setLoading(true);
    try {
      // Change the label while we wait for confirmation
      if (type === 'HardwareWalletKeychain') {
        setWaitingForDevice(true);
        analytics.track(event.dappTransactionSubmitted, {
          dappURL: dappMetadata?.url || '',
          dappDomain: dappMetadata?.appHost || '',
          action: walletAction,
          hardwareWallet: {
            isHardwareWallet: true,
            vendor: vendor,
          },
        });
      }

      if (walletAction === 'personal_sign') {
        result = await wallet.personalSign(
          requestPayload.msgData,
          requestPayload.address,
        );
        analytics.track(
          event.dappPromptSignMessageApproved,
          {
            chainId: activeSession?.chainId,
            dappURL: dappMetadata?.url || '',
            dappDomain: dappMetadata?.appHost || '',
            dappName: dappMetadata?.appName,
          },
          await getWalletContext(activeSession?.address),
        );
      } else if (walletAction === 'sign_typed_data') {
        result = await wallet.signTypedData(
          requestPayload.msgData,
          requestPayload.address,
        );
        analytics.track(
          event.dappPromptSignTypedDataApproved,
          {
            chainId: activeSession?.chainId,
            dappURL: dappMetadata?.url || '',
            dappDomain: dappMetadata?.appHost || '',
            dappName: dappMetadata?.appName,
          },
          await getWalletContext(activeSession?.address),
        );
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
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    activeSession?.chainId,
    activeSession?.address,
    request,
    selectedWallet,
  ]);

  const onRejectRequest = useCallback(async () => {
    rejectRequest();
    if (!activeSession?.address) return;
    const walletAction = getWalletActionMethod(request?.method);
    if (walletAction === 'personal_sign') {
      analytics.track(
        event.dappPromptSignMessageRejected,
        {
          chainId: activeSession?.chainId || 0,
          dappURL: dappMetadata?.url || '',
          dappDomain: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        },
        await getWalletContext(activeSession?.address),
      );
    } else if (walletAction === 'sign_typed_data') {
      analytics.track(
        event.dappPromptSignTypedDataRejected,
        {
          chainId: activeSession?.chainId || 0,
          dappURL: dappMetadata?.url || '',
          dappDomain: dappMetadata?.appHost || '',
          dappName: dappMetadata?.appName,
        },
        await getWalletContext(activeSession?.address),
      );
    }
  }, [
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    activeSession?.chainId,
    activeSession?.address,
    rejectRequest,
    request?.method,
  ]);

  const isWatchingWallet = useMemo(() => {
    const watchedAddresses = watchedWallets?.map(({ address }) => address);
    return selectedWallet && watchedAddresses?.includes(selectedWallet);
  }, [selectedWallet, watchedWallets]);

  const isSigningWithDevice = useMemo(() => {
    const signingWithDevice =
      allWallets.find((w) => isLowerCaseMatch(w.address, selectedWallet))
        ?.type === 'HardwareWalletKeychain';
    return signingWithDevice;
  }, [allWallets, selectedWallet]);

  useEffect(() => {
    if (!featureFlags.full_watching_wallets && isWatchingWallet) {
      triggerAlert({
        text: i18n.t('alert.wallet_watching_mode'),
        callback: rejectRequest,
      });
    }
  }, [featureFlags.full_watching_wallets, isWatchingWallet, rejectRequest]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ height: POPUP_DIMENSIONS.height, overflow: 'hidden' }}
    >
      <SignMessageInfo request={request} />
      <Stack space="20px" padding="20px">
        <Bleed vertical="4px">
          <AccountSigningWith session={activeSession} noFee />
        </Bleed>
        <SignMessageActions
          waitingForDevice={waitingForDevice}
          signingWithDevice={isSigningWithDevice}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Stack>
    </Box>
  );
}
