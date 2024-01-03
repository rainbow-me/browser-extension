import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { Box, Stack } from '~/design-system';

import { AcceptRequestButton, RejectRequestButton } from '../BottomActions';

export const WatchAssetActions = ({
  onAcceptRequest,
  onRejectRequest,
  loading = false,
  dappStatus,
  disabled,
}: {
  appName?: string;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  dappStatus?: DAppStatus;
  disabled: boolean;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Box padding="20px">
      <Stack
        space="8px"
        flexDirection={isScamDapp ? 'column-reverse' : 'column'}
      >
        <AcceptRequestButton
          riskLevel={isScamDapp ? 'MALICIOUS' : 'OK'}
          onClick={onAcceptRequest}
          label={
            isScamDapp
              ? i18n.t('approve_request.approve_anyway')
              : i18n.t('approve_request.approve')
          }
          loading={loading}
          disabled={disabled}
        />
        <RejectRequestButton
          riskLevel={isScamDapp ? 'MALICIOUS' : 'OK'}
          onClick={onRejectRequest}
          label={i18n.t('common_actions.cancel')}
        />
      </Stack>
    </Box>
  );
};
