import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { Box, Column, Columns, Row, Rows, Stack } from '~/design-system';

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
}: {
  waitingForDevice: boolean;
  selectedWallet: Address;
  selectedChainId: ChainId;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
}) => {
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
        <Rows space="8px">
          <Row>
            <AcceptRequestButton
              onClick={onAcceptRequest}
              label={
                waitingForDevice
                  ? i18n.t('approve_request.confirm_hw')
                  : i18n.t('approve_request.sign_message')
              }
              waitingForDevice={waitingForDevice}
            />
          </Row>
          <Row>
            <RejectRequestButton
              onClick={onRejectRequest}
              label={i18n.t('common_actions.cancel')}
            />
          </Row>
        </Rows>
      </Stack>
    </Box>
  );
};
