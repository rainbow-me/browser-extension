import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { Box, Column, Columns, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomDisplayNetwork,
  BottomDisplayWallet,
  RejectRequestButton,
} from '../BottomActions';

export const SignMessageActions = ({
  waitingForDevice,
  selectedWallet,
  selectedChainId,
  onAcceptRequest,
  onRejectRequest,
  loading = false,
  dappStatus,
}: {
  waitingForDevice: boolean;
  selectedWallet: Address;
  selectedChainId: ChainId;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  dappStatus?: DAppStatus;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Box padding="20px">
      <Stack space="24px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column>
            <BottomDisplayWallet selectedWallet={selectedWallet} />
          </Column>
          <Column>
            <BottomDisplayNetwork selectedChainId={selectedChainId} />
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
                : i18n.t(
                    `approve_request.sign_message${
                      isScamDapp ? '_anyway' : ''
                    }`,
                  )
            }
            loading={loading}
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
    </Box>
  );
};
