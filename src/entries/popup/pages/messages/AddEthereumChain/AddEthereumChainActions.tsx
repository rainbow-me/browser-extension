import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { Box, Stack } from '~/design-system';

import { AcceptRequestButton, RejectRequestButton } from '../BottomActions';

export const AddEthereumChainActions = ({
  onAcceptRequest,
  onRejectRequest,
  loading = false,
  dappStatus,
}: {
  appName?: string;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  dappStatus?: DAppStatus;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Box padding="20px">
      <Stack
        space="8px"
        flexDirection={isScamDapp ? 'column-reverse' : 'column'}
      >
        <AcceptRequestButton
          dappStatus={dappStatus}
          onClick={onAcceptRequest}
          label={
            isScamDapp
              ? i18n.t('approve_request.approve_anyway')
              : i18n.t('approve_request.approve')
          }
          loading={loading}
        />
        <RejectRequestButton
          dappStatus={dappStatus}
          onClick={onRejectRequest}
          label={i18n.t('common_actions.cancel')}
        />
      </Stack>
    </Box>
  );
};
