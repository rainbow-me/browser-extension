import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { Column, Columns, Inset, Stack } from '~/design-system';
import { useApproveAppRequestValidations } from '~/entries/popup/hooks/approveAppRequest/useApproveAppRequestValidations';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import {
  AcceptRequestButton,
  BottomDisplayWallet,
  RejectRequestButton,
  WalletBalance,
} from '../BottomActions';

export const SendTransactionActions = ({
  appHost,
  chainId,
  selectedWallet,
  onAcceptRequest,
  onRejectRequest,
  waitingForDevice,
  loading = false,
  dappStatus,
}: {
  appHost: string;
  chainId: ChainId;
  selectedWallet: Address;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  waitingForDevice: boolean;
  loading: boolean;
  dappStatus?: DAppStatus;
}) => {
  const { selectedGas } = useGasStore();
  const { enoughNativeAssetForGas, buttonLabel } =
    useApproveAppRequestValidations({ chainId, selectedGas, dappStatus });
  const { trackShortcut } = useKeyboardAnalytics();
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.transaction_request.CANCEL.key) {
        trackShortcut({
          key: shortcuts.transaction_request.CANCEL.display,
          type: 'send.cancel',
        });
        e.preventDefault();
        onRejectRequest();
      }
    },
  });
  const isScamDapp = dappStatus === DAppStatus.Scam;

  return (
    <Inset vertical="20px" horizontal="20px">
      <Stack space="24px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column>
            <BottomDisplayWallet selectedWallet={selectedWallet} />
          </Column>
          <Column>
            <WalletBalance appHost={appHost} />
          </Column>
        </Columns>

        <Stack
          space="8px"
          flexDirection={isScamDapp ? 'column-reverse' : 'column'}
        >
          <AcceptRequestButton
            dappStatus={dappStatus}
            onClick={onAcceptRequest}
            autoFocus={!isScamDapp}
            label={
              waitingForDevice
                ? i18n.t('approve_request.confirm_hw')
                : buttonLabel
            }
            loading={loading}
            disabled={!enoughNativeAssetForGas}
            waitingForDevice={waitingForDevice}
          />
          <RejectRequestButton
            dappStatus={dappStatus}
            autoFocus={isScamDapp}
            onClick={onRejectRequest}
            label={i18n.t('common_actions.cancel')}
          />
        </Stack>
      </Stack>
    </Inset>
  );
};
