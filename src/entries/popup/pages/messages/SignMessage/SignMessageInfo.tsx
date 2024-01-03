import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

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

import { DappHostName, MaliciousRequestWarning } from '../DappScanStatus';
import { SimulationOverview } from '../Simulation';
import { CopyButton, TabContent, Tabs } from '../Tabs';
import {
  SimulationError,
  TransactionSimulation,
  useSimulateMessage,
} from '../useSimulateTransaction';

interface SignMessageProps {
  request: ProviderRequestPayload;
}

function Overview({
  message,
  typedData,
  simulation,
  status,
  error,
}: {
  message: string | undefined;
  typedData: boolean;
  simulation: TransactionSimulation | undefined;
  status: 'loading' | 'error' | 'success';
  error: SimulationError | null;
}) {
  return (
    <Stack space="16px" paddingTop="14px" marginTop="-14px">
      {typedData && (
        <>
          <Text size="12pt" weight="semibold" color="labelTertiary">
            {i18n.t('simulation.title')}
          </Text>

          <SimulationOverview
            simulation={simulation}
            status={status}
            error={error}
          />

          <Separator color="separatorTertiary" />
        </>
      )}

      <Stack space="20px">
        <Inline space="8px" alignVertical="center">
          <Symbol symbol="signature" size={16} weight="medium" />
          <Text size="14pt" weight="semibold" color="label">
            {i18n.t('simulation.signature.message')}
          </Text>
        </Inline>
        <Box
          style={{ overflowX: 'scroll', overflowY: 'hidden' }}
          paddingHorizontal="20px"
          marginHorizontal="-20px"
          paddingVertical="8px" // this is to not clip the ending of the message
          marginVertical="-8px" // since overflowY is hidden
        >
          <Text
            testId="sign-message-text"
            as="pre"
            size="12pt"
            weight="semibold"
            color="labelTertiary"
            whiteSpace="pre-wrap"
          >
            {message}
          </Text>
        </Box>
      </Stack>
    </Stack>
  );
}

export const SignMessageInfo = ({ request }: SignMessageProps) => {
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });

  const { message, typedData } = getSigningRequestDisplayDetails(request);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;
  const [expanded, setExpanded] = useState(false);

  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const chainId = activeSession?.chainId || ChainId.mainnet;

  const {
    data: simulation,
    status,
    error,
    isRefetching,
  } = useSimulateMessage({
    chainId,
    address: activeSession?.address,
    message: {
      method: request.method,
      params: (request.params || []) as string[],
    },
    domain: dappUrl,
  });

  const tabLabel = (tab: string) => i18n.t(tab, { scope: 'simulation.tabs' });

  const riskLevel = simulation?.scanning.result || 'OK';

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
      justifyContent="flex-start"
      gap="24px"
      height="full"
    >
      <AnimatePresence mode="popLayout">
        {!expanded && (
          <motion.div
            style={{ paddingTop: 20 }}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
          >
            <Stack space="16px" alignItems="center">
              <DappIcon appLogo={dappMetadata?.appLogo} size="36px" />
              <Stack space="12px">
                <DappHostName dappUrl={dappUrl} />
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
        )}
      </AnimatePresence>

      <Tabs
        tabs={[tabLabel('overview')]}
        expanded={expanded}
        onExpand={() => setExpanded((e) => !e)}
      >
        <TabContent value={tabLabel('overview')}>
          <Overview
            message={message}
            typedData={!!typedData}
            simulation={simulation}
            status={status === 'error' && isRefetching ? 'loading' : status}
            error={error}
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
      </Tabs>

      {!expanded && simulation && riskLevel !== 'OK' && (
        <MaliciousRequestWarning
          title={i18n.t('approve_request.malicious_transaction_warning.title')}
          description={simulation.scanning.description}
          symbol={
            riskLevel === 'WARNING'
              ? 'exclamationmark.triangle.fill'
              : 'exclamationmark.octagon.fill'
          }
          color={riskLevel === 'WARNING' ? 'orange' : 'red'}
        />
      )}
    </Box>
  );
};
