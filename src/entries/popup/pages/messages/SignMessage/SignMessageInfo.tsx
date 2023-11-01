import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { TabContent, TabFloatingButton, Tabs } from '../Tabs';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

export function SimulationNoChangesDetected() {
  return (
    <Inline space="8px" alignVertical="center">
      <Symbol
        symbol="waveform.and.magnifyingglass"
        color="labelTertiary"
        size={16}
        weight="medium"
      />
      <Text size="14pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.no_changes')}
      </Text>
    </Inline>
  );
}

function Overview({ message }: { message?: string }) {
  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.title')}
      </Text>
      <SimulationNoChangesDetected />

      <Separator color="separatorTertiary" />

      <Stack space="20px">
        <Inline space="8px" alignVertical="center">
          <Symbol symbol="signature" size={16} weight="medium" />
          <Text size="14pt" weight="semibold" color="label">
            {i18n.t('simulation.signature.message')}
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

function CopyButton({ onClick }: { onClick: VoidFunction }) {
  return (
    <TabFloatingButton onClick={onClick} style={{ bottom: 12, left: 12 }}>
      <Symbol
        symbol={'square.on.square'}
        size={12}
        color="labelSecondary"
        weight="bold"
      />
      <Text size="14pt" weight="semibold" color="labelSecondary">
        {i18n.t('copy')}
      </Text>
    </TabFloatingButton>
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
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      background="surfacePrimaryElevatedSecondary"
      style={{ minHeight: 397, overflow: 'hidden' }}
      borderColor="separatorTertiary"
      borderWidth="1px"
      paddingHorizontal="20px"
      paddingVertical="20px"
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      gap="24px"
      height="full"
    >
      <motion.div style={{ height: expanded ? 0 : 'auto' }}>
        <Stack space="16px" alignItems="center" paddingTop="20px">
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
      </motion.div>

      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        alignItems="center"
        height="full"
      >
        <Tabs
          tabs={['Overview', 'Details']}
          expanded={expanded}
          onExpand={() => setExpanded((e) => !e)}
        >
          <TabContent value="Overview">
            <Overview message={message} />
            <CopyButton onClick={() => null} />
          </TabContent>
          <TabContent value="Details">
            <Details />
          </TabContent>
        </Tabs>

        {dappMetadata?.status === DAppStatus.Scam ? (
          <ThisDappIsLikelyMalicious />
        ) : null}
      </Box>
    </Box>
  );
};
