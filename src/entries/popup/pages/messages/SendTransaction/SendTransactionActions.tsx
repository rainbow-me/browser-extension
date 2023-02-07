import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Column, Columns, Inset, Row, Rows, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomDisplayWallet,
  RejectRequestButton,
  WalletBalance,
} from '../BottomActions';

export const SendTransactionActions = ({
  appHost,
  selectedWallet,
  onAcceptRequest,
  onRejectRequest,
  waitingForDevice,
}: {
  appHost: string;
  selectedWallet: Address;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  waitingForDevice: boolean;
}) => {
  return (
    <Inset vertical="20px" horizontal="20px">
      <Stack space="24px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column>
            <BottomDisplayWallet selectedWallet={selectedWallet} />
          </Column>
          <Column>
            <WalletBalance appHost={appHost} />
          </Column>
        </Columns>
        <Rows space="8px">
          <Row>
            <AcceptRequestButton
              onClick={onAcceptRequest}
              label={
                waitingForDevice
                  ? i18n.t('approve_request.confirm_hw')
                  : i18n.t('approve_request.send_transaction')
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
    </Inset>
  );
};
