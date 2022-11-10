import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Row, Rows, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomDisplayWallet,
  RejectRequestButton,
  WalletBalance,
} from '../BottomButtons';

export const SendTransactionActions = ({
  selectedWallet,
  onAcceptRequest,
  onRejectRequest,
}: {
  selectedWallet: Address;
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
            <WalletBalance />
          </Column>
        </Columns>
        <Rows space="8px">
          <Row>
            <AcceptRequestButton
              onClick={onAcceptRequest}
              label={i18n.t('approve_request.send_transaction')}
            />
          </Row>
          <Row>
            <RejectRequestButton
              onClick={onRejectRequest}
              label={i18n.t('approve_request.cancel')}
            />
          </Row>
        </Rows>
      </Stack>
    </Box>
  );
};
