import { useMemo, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import {
  Box,
  Inline,
  Inset,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { ExpandableScrollAreaWithGradient } from '../SendTransaction/SendTransactionsInfo';
import { TabContent, Tabs, TabsNav } from '../Tabs';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

function Overview({ message }: { message?: string }) {
  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        Simulated Result
      </Text>
      <Inline space="8px" alignVertical="center">
        <Symbol
          symbol="waveform.and.magnifyingglass"
          color="labelTertiary"
          size={16}
          weight="medium"
        />
        <Text size="14pt" weight="semibold" color="labelTertiary">
          No Changes Detected
        </Text>
      </Inline>

      <Separator color="separatorTertiary" />

      <Stack space="20px">
        <Inline space="8px" alignVertical="center">
          <Symbol symbol="signature" size={16} weight="medium" />
          <Text size="14pt" weight="semibold" color="label">
            Message
          </Text>
        </Inline>
        <Text as="pre" size="12pt" weight="semibold" color="labelTertiary">
          {message}
        </Text>
      </Stack>
    </Stack>
  );
}

function Details() {
  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        Details
      </Text>
    </Stack>
  );
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
  const [tab, setTab] = useState('Overview');

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      style={{ minHeight: 397, height: '100%' }}
      borderColor="separatorTertiary"
      borderWidth="1px"
    >
      <Stack
        space="24px"
        paddingHorizontal="20px"
        paddingTop="40px"
        paddingBottom="16px"
        height="full"
      >
        <Stack space="16px" alignItems="center">
          <DappIcon appLogo={dappMetadata?.appLogo} size="36px" />
          <Stack space="12px">
            <DappHostName
              hostName={dappMetadata?.appHostName}
              dappStatus={dappMetadata?.status}
            />
            <Text
              align="center"
              size="14pt"
              weight="bold"
              color={isScamDapp ? 'red' : 'labelSecondary'}
            >
              {i18n.t('approve_request.message_signing_request')}
            </Text>
          </Stack>
        </Stack>

        <Box
          display="flex"
          flexDirection="column"
          gap="20px"
          alignItems="center"
          height="full"
          style={{ overflow: 'hidden', height: '100%' }}
        >
          <Tabs tabs={['Overview', 'Details']} tab={tab} setTab={setTab}>
            <Box
              display="flex"
              flexDirection="column"
              padding="20px"
              background="surfaceSecondaryElevated"
              borderRadius="20px"
              borderColor="separatorSecondary"
              borderWidth="1px"
              width="full"
              position="relative"
              style={{ maxHeight: 300, overflow: 'hidden' }}
            >
              <TabsNav />
              <Inset top="20px">
                <Separator color="separatorTertiary" />
              </Inset>
              <ExpandableScrollAreaWithGradient key={tab} tab={tab}>
                <TabContent value="Overview">
                  <Overview message={message} />
                </TabContent>
                <TabContent value="Details">
                  <Details />
                </TabContent>
              </ExpandableScrollAreaWithGradient>
            </Box>
          </Tabs>

          {dappMetadata?.status === DAppStatus.Scam ? (
            <ThisDappIsLikelyMalicious />
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};
