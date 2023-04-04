import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { Column, Columns, Inset, Row, Rows, Stack } from '~/design-system';
import { useApproveAppRequestValidations } from '~/entries/popup/hooks/approveAppRequest/useApproveAppRequestValidations';

import {
  AcceptRequestButton,
  BottomDisplayWallet,
  RejectRequestButton,
  WalletBalance,
} from '../BottomActions';

export const SendTransactionActions = ({
  appHost,
  chainId,
  selectedWallet,
  onAcceptRequest,
  onRejectRequest,
  waitingForDevice,
  loading = false,
}: {
  appHost: string;
  chainId: ChainId;
  selectedWallet: Address;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  waitingForDevice: boolean;
  loading: boolean;
}) => {
  const { selectedGas } = useGasStore();
  const { enoughNativeAssetForGas, buttonLabel } =
    useApproveAppRequestValidations({ chainId, selectedGas });
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
              disabled={!enoughNativeAssetForGas}
              onClick={onAcceptRequest}
              label={
                waitingForDevice
                  ? i18n.t('approve_request.confirm_hw')
                  : buttonLabel
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
    </Inset>
  );
};
