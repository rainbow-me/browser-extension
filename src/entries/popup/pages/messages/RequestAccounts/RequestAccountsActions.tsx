import React from 'react';
import { Address, Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Row, Rows, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomSwitchNetwork,
  BottomSwitchWallet,
  RejectRequestButton,
} from '../BottomButtons';

export const RequestAccountsActions = ({
  selectedWallet,
  setSelectedWallet,
  selectedNetwork,
  setSelectedNetwork,
  onAcceptRequest,
  onRejectRequest,
  appName,
}: {
  appName?: string;
  selectedWallet: Address;
  setSelectedWallet: (value: Address) => void;
  selectedNetwork: Chain;
  setSelectedNetwork: (value: Chain) => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
}) => {
  return (
    <Box padding="20px">
      <Stack space="24px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column>
            <BottomSwitchWallet
              selectedWallet={selectedWallet}
              setSelectedWallet={setSelectedWallet}
            />
          </Column>
          <Column>
            <BottomSwitchNetwork
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
            />
          </Column>
        </Columns>
        <Rows space="8px">
          <Row>
            <AcceptRequestButton
              onClick={onAcceptRequest}
              label={i18n.t('approve_request.connect', { appName })}
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
