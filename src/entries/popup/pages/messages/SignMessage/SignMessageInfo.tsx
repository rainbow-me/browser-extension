import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box, Inline, Inset, Separator, Stack, Text } from '~/design-system';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

export const SignMessageInfo = ({ request }: SignMessageProps) => {
  const { appHostName, appLogo } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });

  const message = useMemo(() => {
    const { message } = getSigningRequestDisplayDetails(request);
    return message;
  }, [request]);

  return (
    <Box background="surfacePrimaryElevatedSecondary">
      <Inset top="40px" bottom="20px">
        <Inset bottom="8px">
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
                {i18n.t('approve_request.message_signing_request')}
              </Text>
            </Stack>
          </Stack>
        </Inset>

        <Inset horizontal="20px" top="32px" bottom="12px">
          <Text
            align="left"
            size="14pt"
            weight="semibold"
            color="labelSecondary"
          >
            {i18n.t('approve_request.message')}
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
  );
};
