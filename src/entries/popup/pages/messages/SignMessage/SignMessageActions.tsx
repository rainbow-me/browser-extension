import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Row, Rows, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomDisplayNetwork,
  BottomDisplayWallet,
  RejectRequestButton,
} from '../BottomButtons';
import { SelectedNetwork } from '../RequestAccounts';

export const SignMessageActions = ({
  selectedWallet,
  selectedNetwork,
  onAcceptRequest,
  onRejectRequest,
}: {
  selectedWallet: Address;
  selectedNetwork: SelectedNetwork;
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
            <BottomDisplayNetwork selectedNetwork={selectedNetwork} />
          </Column>
        </Columns>
        <Rows space="8px">
          <Row>
            <AcceptRequestButton
              onClick={onAcceptRequest}
              label={i18n.t('approve_request.sign_message')}
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
