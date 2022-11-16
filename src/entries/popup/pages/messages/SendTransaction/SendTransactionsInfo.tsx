import React, { useMemo } from 'react';
import { chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box, Inline, Inset, Separator, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

export function SendTransactionInfo({ request }: SignMessageProps) {
  const { appHostName, appLogo } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });

  const { value } = useMemo(() => {
    const { value } = getRequestDisplayDetails(request);
    return { value };
  }, [request]);

  return (
    <Box background="surfacePrimaryElevatedSecondary">
      <Inset top="40px" bottom="16px">
        <Stack space="10px">
          <Inset bottom="8px">
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
                  {i18n.t('approve_request.transaction_request')}
                </Text>
              </Stack>
            </Stack>
          </Inset>

          <Inset vertical="64px" horizontal="50px">
            <Stack space="16px" alignHorizontal="center">
              <Text align="center" size="32pt" weight="heavy" color="label">
                {value}
              </Text>
              <Box background="surfacePrimaryElevated" borderRadius="18px">
                <Inset vertical="6px" left="8px" right="10px">
                  <Inline
                    space="4px"
                    alignVertical="center"
                    alignHorizontal="center"
                  >
                    <ChainBadge chainId={chain.mainnet.id} size={'small'} />
                    <Text size="14pt" weight="semibold" color="label">
                      {value}
                    </Text>
                  </Inline>
                </Inset>
              </Box>
            </Stack>
          </Inset>

          {
            // TODO gas component
          }
          <Box style={{ height: 32 }} />
        </Stack>
      </Inset>
      <Separator color="separatorTertiary" />
    </Box>
  );
}
