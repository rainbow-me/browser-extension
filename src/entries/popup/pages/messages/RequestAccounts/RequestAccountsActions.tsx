import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { Box, Column, Columns, Stack } from '~/design-system';

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
  loading = false,
  status,
}: {
  appName?: string;
  selectedWallet: Address;
  setSelectedWallet: (value: Address) => void;
  selectedChainId: ChainId;
  setSelectedChainId: (value: ChainId) => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  loading?: boolean;
  status?: DAppStatus;
}) => {
  const isScamDapp = status === DAppStatus.Scam;
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
        <Stack
          space="8px"
          flexDirection={isScamDapp ? 'column-reverse' : 'column'}
        >
          <AcceptRequestButton
            dappStatus={status}
            onClick={onAcceptRequest}
            autoFocus={!isScamDapp}
            label={
              isScamDapp
                ? i18n.t('approve_request.connect_anyway')
                : i18n.t('approve_request.connect', { appName })
            }
            loading={loading}
          />
          <RejectRequestButton
            dappStatus={status}
            autoFocus={isScamDapp}
            onClick={onRejectRequest}
            label={i18n.t('common_actions.cancel')}
          />
        </Stack>
      </Stack>
    </Box>
  );
};
