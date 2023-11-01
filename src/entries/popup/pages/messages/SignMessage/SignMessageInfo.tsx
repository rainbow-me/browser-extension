import { TransactionRequest } from '@ethersproject/providers';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { TabContent, TabFloatingButton, Tabs } from '../Tabs';
import { useSimulateTransaction } from '../useSimulateTransaction';

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
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });

  const { message, typedData } = useMemo(() => {
    const { message, typedData } = getSigningRequestDisplayDetails(request);
    return { message, typedData };
  }, [request]);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;
  const [expanded, setExpanded] = useState(false);

  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const txRequest = request?.params?.[0] as TransactionRequest;

  const chainId = activeSession?.chainId || ChainId.mainnet;

  const { data: simulation, status } = useSimulateTransaction({
    chainId,
    transaction: {
      from: txRequest.from || '',
      to: txRequest.to || '',
      value: txRequest.value?.toString() || '0',
      data: txRequest.data?.toString() || '',
    },
    domain: dappUrl,
  });

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
      <Box
        as={motion.div}
        style={{
          maxHeight: expanded ? 0 : '100%',
          overflow: expanded ? 'hidden' : 'unset',
          paddingTop: expanded ? 0 : '20px',
          opacity: expanded ? 0 : 1,
        }}
        transition={{ duration: 1 }}
        display="flex"
        flexDirection="column"
        gap="16px"
        alignItems="center"
      >
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
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap="20px"
        alignItems="center"
        height="full"
        style={{ overflow: 'hidden' }}
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
