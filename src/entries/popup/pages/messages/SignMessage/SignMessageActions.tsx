import React, { useEffect } from 'react';
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
  loading = false,
}: {
  waitingForDevice: boolean;
  selectedWallet: Address;
  selectedChainId: ChainId;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
}) => {
  useEffect(() => {
    const confirmCta = document.querySelector(
      '[data-testid="reject-request-button"]',
    ) as HTMLButtonElement;
    setTimeout(() => confirmCta.focus(), 300);
  }, []);
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
              loading={loading}
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
