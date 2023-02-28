import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { Box, Column, Columns, Row, Rows, Stack } from '~/design-system';

import {
  AcceptRequestButton,
  BottomSwitchNetwork,
  BottomSwitchWallet,
  RejectRequestButton,
} from '../BottomActions';

export const RequestAccountsActions = ({
  selectedWallet,
  setSelectedWallet,
  selectedChainId,
  setSelectedChainId,
  onAcceptRequest,
  onRejectRequest,
  appName,
}: {
  appName?: string;
  selectedWallet: Address;
  setSelectedWallet: (value: Address) => void;
  selectedChainId: ChainId;
  setSelectedChainId: (value: ChainId) => void;
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
              selectedChainId={selectedChainId}
              setSelectedChainId={setSelectedChainId}
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
              label={i18n.t('common_actions.cancel')}
            />
          </Row>
        </Rows>
      </Stack>
    </Box>
  );
};
