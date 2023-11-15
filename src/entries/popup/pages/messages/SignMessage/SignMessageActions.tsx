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
}: {
  waitingForDevice: boolean;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  dappStatus?: DAppStatus;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Inline space="12px" wrap={false}>
      <RejectRequestButton
        dappStatus={dappStatus}
        autoFocus={isScamDapp}
        onClick={onRejectRequest}
        label={i18n.t('common_actions.cancel')}
      />
      <AcceptRequestButton
        dappStatus={dappStatus}
        onClick={onAcceptRequest}
        autoFocus={!isScamDapp}
        label={
          waitingForDevice
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
