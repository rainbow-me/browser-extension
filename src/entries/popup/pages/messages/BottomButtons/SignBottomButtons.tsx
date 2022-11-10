import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Row, Rows, Stack, Text } from '~/design-system';

import { SelectedNetwork } from '../RequestAccounts';

import { BottomNetwork, BottomWallet } from './BottomButtons';
export const SignBottomButtons = ({
  selectedWallet,
  selectedNetwork,
  onApproveRequest,
  onRejectRequest,
}: {
  selectedWallet: Address;
  selectedNetwork: SelectedNetwork;
  onApproveRequest: () => void;
  onRejectRequest: () => void;
}) => {
  return (
    <Box padding="20px">
      <Stack space="24px">
        <Columns alignVertical="center" alignHorizontal="justify">
          <Column>
            <Stack space="8px">
              <Text size="12pt" weight="semibold" color="labelQuaternary">
                {i18n.t('approve_request.wallet')}
              </Text>
              <BottomWallet
                selectedWallet={selectedWallet}
                displaySymbol={false}
              />
            </Stack>
          </Column>
          <Column>
            <Stack space="8px">
              <Text
                align="right"
                size="12pt"
                weight="semibold"
                color="labelQuaternary"
              >
                {i18n.t('approve_request.network')}
              </Text>
              <BottomNetwork
                selectedNetwork={selectedNetwork}
                displaySymbol={false}
              />
            </Stack>
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
                {'Sign Message'}
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
