import React, { useMemo } from 'react';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getRequestDisplayDetails } from '~/core/utils/signMessages';
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

import { useAppSession } from '../../hooks/useAppSession';

import { SignBottomButtons } from './BottomButtons/BottomButtons';

interface ApproveRequestProps {
  approveRequest: () => void;
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
  const { appHostName, appLogo, appHost } = useAppMetadata({
    url: request?.meta?.sender?.url || '',
  });
  const { appSession } = useAppSession({ host: appHost });
  const selectedNetwork = supportedChains[appSession.chainId];
  const selectedWallet = appSession.address;

  const message = useMemo(() => {
    const { message } = getRequestDisplayDetails(request);
    return message;
  }, [request]);

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
                    overflow: 'scroll',
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
                style={{ height: 189, overflow: 'hidden' }}
              >
                <Inset horizontal="20px" vertical="20px">
                  <Text weight="regular" color="label" size="14pt">
                    {message}
                  </Text>
                </Inset>
              </Box>
            </Inset>
          </Inset>
          <Separator color="separatorTertiary" />
        </Box>
      </Row>
      <Row height="content">
        <SignBottomButtons
          selectedWallet={selectedWallet}
          selectedNetwork={selectedNetwork}
          onApproveRequest={approveRequest}
          onRejectRequest={rejectRequest}
        />
      </Row>
    </Rows>
  );
}
