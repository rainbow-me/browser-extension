import { useMemo } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box, Inset, Stack, Text } from '~/design-system';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

export const SignMessageInfo = ({ request }: SignMessageProps) => {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });

  const { message, typedData } = useMemo(() => {
    const { message, typedData } = getSigningRequestDisplayDetails(request);
    return { message, typedData };
  }, [request]);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      style={{ height: 410 }}
      borderColor="separatorTertiary"
      borderWidth="1px"
      paddingTop="40px"
      paddingBottom="20px"
    >
      <Inset bottom="8px">
        <Stack space="16px" alignItems="center">
          <DappIcon appLogo={dappMetadata?.appLogo} size="32px" />
          <Stack space="12px">
            <DappHostName
              hostName={dappMetadata?.appHostName}
              dappStatus={dappMetadata?.status}
            />
            <Text align="center" size="14pt" weight="bold">
              {i18n.t('approve_request.message_signing_request')}
            </Text>
          </Stack>
        </Stack>
      </Inset>

      <Inset horizontal="20px" top="32px" bottom="12px">
        <Text align="left" size="14pt" weight="semibold" color="labelTertiary">
          {i18n.t('approve_request.message')}
        </Text>
      </Inset>

      <Stack
        space="12px"
        paddingHorizontal="20px"
        alignItems="center"
        height="full"
      >
        <Box
          background="surfacePrimaryElevated"
          borderRadius="16px"
          borderColor="separatorSecondary"
          borderWidth="1px"
          width="full"
          style={{
            height: isScamDapp ? 110 : 189,
            overflowX: 'auto',
            overflowY: 'auto',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
          }}
          padding="20px"
        >
          <Text
            weight="regular"
            color="label"
            size="14pt"
            testId="sign-message-text"
          >
            {typedData ? <pre>{message}</pre> : message}
          </Text>
        </Box>
        {isScamDapp ? <ThisDappIsLikelyMalicious /> : null}
      </Stack>
    </Box>
  );
};
