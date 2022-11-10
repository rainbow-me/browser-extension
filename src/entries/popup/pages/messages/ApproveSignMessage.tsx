import React, { useCallback, useState } from 'react';
import { Address, chain } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import {
  Box,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { supportedChains } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

import { ApproveBottomButtons } from './ApproveBottomButtons';

interface ApproveRequestProps {
  approveRequest: (payload: { address: Address; chainId: number }) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

export function ApproveSignMessage({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { currentAddress } = useCurrentAddressStore();
  const { appHostName, appLogo, appName } = useAppMetadata({
    meta: request?.meta,
  });

  const [selectedNetwork, setSelectedNetwork] = useState<SelectedNetwork>(
    supportedChains[chain.mainnet.id],
  );
  const [selectedWallet, setSelectedWallet] = useState<Address>(currentAddress);

  const onApproveRequest = useCallback(() => {
    approveRequest({
      address: selectedWallet,
      chainId: selectedNetwork.chainId,
    });
  }, [approveRequest, selectedNetwork.chainId, selectedWallet]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <Box background="surfacePrimaryElevatedSecondary">
          <Inset top="40px" bottom="20px">
            <Stack space="16px">
              <Inline alignHorizontal="center">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    overflow: 'hidden',
                  }}
                  borderRadius="18px"
                  alignItems="center"
                >
                  {appLogo ? (
                    <img src={appLogo} width="100%" height="100%" />
                  ) : null}
                </Box>
              </Inline>
              <Stack space="12px">
                <Text
                  align="center"
                  size="20pt"
                  weight="semibold"
                  color="labelSecondary"
                >
                  {appHostName}
                </Text>
                <Text align="center" size="20pt" weight="semibold">
                  {'Message Signing Request'}
                </Text>
              </Stack>
            </Stack>
            <Inset horizontal="20px" top="32px" bottom="12px">
              <Text
                align="left"
                size="14pt"
                weight="semibold"
                color="labelSecondary"
              >
                {'Message'}
              </Text>
            </Inset>
            <Inset horizontal="20px">
              <Box
                background="surfacePrimaryElevated"
                borderRadius="12px"
                style={{ height: 189 }}
              >
                <Inset horizontal="20px" vertical="20px">
                  <Text weight="regular" color="label" size="14pt">
                    {'Wen token'}
                  </Text>
                </Inset>
              </Box>
            </Inset>
          </Inset>
          <Separator color="separatorTertiary" />
        </Box>
      </Row>
      <Row height="content">
        <ApproveBottomButtons
          selectedWallet={selectedWallet}
          setSelectedWallet={setSelectedWallet}
          selectedNetwork={selectedNetwork}
          setSelectedNetwork={setSelectedNetwork}
          onApproveRequest={onApproveRequest}
          onRejectRequest={rejectRequest}
          appName={appName}
        />
      </Row>
    </Rows>
  );
}
