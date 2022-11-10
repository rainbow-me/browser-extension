import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Row, Rows, Stack, Text } from '~/design-system';

import { BottomSwitchNetwork, BottomSwitchWallet } from '../BottomButtons';

import { SelectedNetwork } from '.';

export const RequestAccountsActions = ({
  selectedWallet,
  setSelectedWallet,
  selectedNetwork,
  setSelectedNetwork,
  onApproveRequest,
  onRejectRequest,
  appName,
}: {
  appName?: string;
  selectedWallet: Address;
  setSelectedWallet: (value: Address) => void;
  selectedNetwork: SelectedNetwork;
  setSelectedNetwork: (value: SelectedNetwork) => void;
  onApproveRequest: () => void;
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
            <Box
              as="button"
              id="accept-request-button"
              background="accent"
              width="full"
              onClick={onApproveRequest}
              padding="16px"
              borderRadius="round"
              boxShadow="24px accent"
            >
              <Text color="label" size="14pt" weight="bold">
                {i18n.t('approve_request.connect', { appName })}
              </Text>
            </Box>
          </Row>
          <Row>
            <Box
              as="button"
              id="reject-request-button"
              onClick={onRejectRequest}
              width="full"
              padding="16px"
              borderRadius="round"
            >
              <Text color="labelSecondary" size="14pt" weight="bold">
                {i18n.t('approve_request.cancel')}
              </Text>
            </Box>
          </Row>
        </Rows>
      </Stack>
    </Box>
  );
};
