import { TransactionRequest } from '@ethersproject/providers';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { copy } from '~/core/utils/copy';
import { getSigningRequestDisplayDetails } from '~/core/utils/signMessages';
import { truncateString } from '~/core/utils/strings';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { SimulationOverview } from '../Simulation';
import { CopyButton, TabContent, Tabs } from '../Tabs';
import {
  TransactionSimulation,
  useSimulateTransaction,
} from '../useSimulateTransaction';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

function Overview({
  message,
  simulation,
  status,
}: {
  message?: string;
  simulation: TransactionSimulation | undefined;
  status: 'loading' | 'error' | 'success';
}) {
  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.title')}
      </Text>

      <SimulationOverview simulation={simulation} status={status} />

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

export const SignMessageInfo = ({ request }: SignMessageProps) => {
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });

  const { message } = useMemo(() => {
    const { message, typedData } = getSigningRequestDisplayDetails(request);
    return { message, typedData };
  }, [request]);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;
  const [expanded, setExpanded] = useState(false);

  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const txRequest = request?.params?.[0] as TransactionRequest;

  const chainId = activeSession?.chainId || ChainId.mainnet;

  const {
    data: simulation,
    status,
    isRefetching,
  } = useSimulateTransaction({
    chainId,
    transaction: {
      from: txRequest.from || '',
      to: txRequest.to || '',
      value: txRequest.value?.toString() || '0',
      data: txRequest.data?.toString() || '',
    },
    domain: dappUrl,
  });

  const tabLabel = (tab: string) => i18n.t(tab, { scope: 'simulation.tabs' });

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
      <motion.div
        style={{
          maxHeight: expanded ? 0 : '100%',
          overflow: expanded ? 'hidden' : 'unset',
          paddingTop: expanded ? 0 : '20px',
          opacity: expanded ? 0 : 1,
        }}
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
              {isScamDapp
                ? i18n.t('approve_request.dangerous_request')
                : i18n.t('approve_request.message_signing_request')}
            </Text>
          </Stack>
        </Stack>
      </motion.div>

      <Tabs
        tabs={[tabLabel('overview'), tabLabel('details')]}
        expanded={expanded}
        onExpand={() => setExpanded((e) => !e)}
      >
        <TabContent value={tabLabel('overview')}>
          <Overview
            message={message}
            simulation={simulation}
            status={status === 'error' && isRefetching ? 'loading' : status}
          />
          <CopyButton
            withLabel={expanded}
            onClick={() =>
              copy({
                value: message || '',
                title: i18n.t('approve_request.message_copied'),
                description: truncateString(message, 20),
              })
            }
          />
        </TabContent>
        <TabContent value={tabLabel('details')}>
          <Details />
        </TabContent>
      </Tabs>

      {!expanded && isScamDapp && <ThisDappIsLikelyMalicious />}
    </Box>
  );
};
