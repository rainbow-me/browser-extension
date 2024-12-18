import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { Inline } from '~/design-system';

import { AcceptRequestButton, RejectRequestButton } from '../BottomActions';

export const SignMessageActions = ({
  waitingForDevice,
  onAcceptRequest,
  onRejectRequest,
  loading = false,
  dappStatus,
  signingWithDevice,
}: {
  waitingForDevice: boolean;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  dappStatus?: DAppStatus;
  signingWithDevice?: boolean;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Inline space="12px" wrap={false}>
      <RejectRequestButton
        dappStatus={dappStatus}
        onClick={onRejectRequest}
        label={i18n.t('common_actions.cancel')}
        waitingForDevice={signingWithDevice}
      />
      <AcceptRequestButton
        dappStatus={dappStatus}
        onClick={onAcceptRequest}
        label={
          signingWithDevice
            ? i18n.t('approve_request.confirm_hw')
            : i18n.t(
                `approve_request.sign_message${isScamDapp ? '_anyway' : ''}`,
              )
        }
        loading={loading}
        waitingForDevice={waitingForDevice}
      />
    </Inline>
  );
};
