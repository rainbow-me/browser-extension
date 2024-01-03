import { i18n } from '~/core/languages';
import { Inline } from '~/design-system';

import { AcceptRequestButton, RejectRequestButton } from '../BottomActions';
import { RequestRiskLevel } from '../useSimulateTransaction';

export const SignMessageActions = ({
  waitingForDevice,
  onAcceptRequest,
  onRejectRequest,
  loading = false,
  riskLevel,
}: {
  waitingForDevice: boolean;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  riskLevel?: RequestRiskLevel;
}) => {
  const isMalicious = riskLevel === 'MALICIOUS';
  return (
    <Inline space="12px" wrap={false}>
      <RejectRequestButton
        riskLevel={riskLevel}
        onClick={onRejectRequest}
        label={i18n.t('common_actions.cancel')}
      />
      <AcceptRequestButton
        riskLevel={riskLevel}
        onClick={onAcceptRequest}
        label={
          waitingForDevice
            ? i18n.t('approve_request.confirm_hw')
            : i18n.t(
                `approve_request.sign_message${isMalicious ? '_anyway' : ''}`,
              )
        }
        loading={loading}
        waitingForDevice={waitingForDevice}
      />
    </Inline>
  );
};
