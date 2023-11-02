/* eslint-disable @typescript-eslint/ban-types */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { DappMetadata, useDappMetadata } from '~/core/resources/metadata/dapp';
import { useNonceStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { copy } from '~/core/utils/copy';
import { formatDate } from '~/core/utils/formatDate';
import { truncateString } from '~/core/utils/strings';
import {
  Bleed,
  Box,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolName, globalColors } from '~/design-system/styles/designTokens';
import { AddressDisplay } from '~/entries/popup/components/AddressDisplay';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { Tag } from '~/entries/popup/components/Tag';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';

import {
  DappHostName,
  ThisDappIsLikelyMalicious,
  getDappStatusBadge,
} from '../DappScanStatus';
import { SimulationOverview } from '../Simulation';
import { CopyButton, TabContent, Tabs } from '../Tabs';
import {
  TransactionSimulation,
  useSimulateTransaction,
} from '../useSimulateTransaction';

interface SendTransactionProps {
  request: ProviderRequestPayload;
}

const InfoRow = ({
  symbol,
  label,
  value,
}: {
  symbol: SymbolName;
  label: ReactNode;
  value: ReactNode;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="16px"
  >
    <Inline alignVertical="center" space="12px" wrap={false}>
      <Symbol size={14} symbol={symbol} weight="medium" color="labelTertiary" />
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {label}
      </Text>
    </Inline>
    <Text
      color="labelSecondary"
      size="12pt"
      weight="semibold"
      cursor="text"
      userSelect="all"
    >
      {value}
    </Text>
  </Box>
);

function Overview({
  simulation,
  status,
  metadata,
}: {
  simulation: TransactionSimulation | undefined;
  status: 'loading' | 'error' | 'success';
  metadata: DappMetadata | null;
}) {
  const chainId = simulation?.chainId;

  const { badge, color } = getDappStatusBadge(
    metadata?.status || DAppStatus.Unverified,
    { size: 12 },
  );

  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.title')}
      </Text>

      <SimulationOverview simulation={simulation} status={status} />

      <Separator color="separatorTertiary" />

      {chainId && ChainNameDisplay[chainId] && (
        <InfoRow
          symbol="network"
          label={i18n.t('chain')}
          value={
            <Inline space="6px" alignVertical="center">
              <ChainBadge chainId={chainId} size={14} />
              <Text size="12pt" weight="semibold" color="labelSecondary">
                {ChainNameDisplay[chainId]}
              </Text>
            </Inline>
          }
        />
      )}

      {metadata && (
        <InfoRow
          symbol="app.badge.checkmark"
          label="App"
          value={
            <Tag
              size="12pt"
              color={color}
              style={{ borderColor: globalColors.blueA10 }}
              bleed
              left={badge && <Bleed vertical="3px">{badge}</Bleed>}
            >
              {metadata.appName}
            </Tag>
          }
        />
      )}
    </Stack>
  );
}

function TransactionDetails({
  simulation,
  session,
}: {
  simulation: TransactionSimulation | undefined;
  session: { address: Address; chainId: ChainId };
}) {
  const metaTo = simulation?.meta.to;

  const { getNonce } = useNonceStore();
  const { currentNonce: nonce } = getNonce(session) || {};

  const functionName = metaTo?.function.split('(')[0];
  const contract = metaTo?.address;
  const contractName = metaTo?.name;
  const isSourceCodeVerified = metaTo?.sourceCodeStatus === 'VERIFIED';
  const contractCreatedAt = metaTo?.created;

  return (
    <Box gap="16px" display="flex" flexDirection="column">
      {!!nonce && (
        <InfoRow symbol="number" label={i18n.t('nonce')} value={nonce} />
      )}
      {functionName && (
        <InfoRow
          symbol="curlybraces"
          label={i18n.t('simulation.function')}
          value={
            <Tag size="12pt" color="labelSecondary" bleed>
              {functionName}
            </Tag>
          }
        />
      )}
      {contract && (
        <InfoRow
          symbol="doc.plaintext"
          label={i18n.t('simulation.contract')}
          value={<AddressDisplay address={contract} hideAvatar />}
        />
      )}
      {contractName && (
        <InfoRow
          symbol="person"
          label={i18n.t('simulation.contract_name')}
          value={contractName}
        />
      )}
      {contractCreatedAt && (
        <InfoRow
          symbol="calendar"
          label={i18n.t('simulation.contract_created_at')}
          value={formatDate(contractCreatedAt)}
        />
      )}
      <InfoRow
        symbol="doc.text.magnifyingglass"
        label={i18n.t('simulation.source_code')}
        value={
          <Tag
            size="12pt"
            color={isSourceCodeVerified ? 'green' : 'labelSecondary'}
            style={{ borderColor: globalColors.greenA10 }}
            bleed
          >
            {isSourceCodeVerified ? 'Verified' : 'Unverified'}
          </Tag>
        }
      />
    </Box>
  );
}

function TransactionData({ data }: { data: string }) {
  return (
    <Text size="12pt" weight="medium" color="labelSecondary">
      <span style={{ wordWrap: 'break-word' }}>{data}</span>
    </Text>
  );
}

export function SendTransactionInfo({ request }: SendTransactionProps) {
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const txRequest = request?.params?.[0] as TransactionRequest;
  const txData = txRequest?.data?.toString() || '';

  const chainId = activeSession?.chainId || ChainId.mainnet;

  const [expanded, setExpanded] = useState(false);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;

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
                : i18n.t('approve_request.transaction_request')}
            </Text>
          </Stack>
        </Stack>
      </motion.div>

      <Tabs
        tabs={[tabLabel('overview'), tabLabel('details'), tabLabel('data')]}
        expanded={expanded}
        onExpand={() => setExpanded((e) => !e)}
      >
        <TabContent value={tabLabel('overview')}>
          <Overview
            simulation={simulation}
            status={status === 'error' && isRefetching ? 'loading' : status}
            metadata={dappMetadata}
          />
        </TabContent>
        <TabContent value={tabLabel('details')}>
          <TransactionDetails
            session={activeSession!}
            simulation={simulation}
          />
        </TabContent>
        <TabContent value={tabLabel('data')}>
          <TransactionData data={txData} />
          <CopyButton
            onClick={() =>
              copy({
                value: txData,
                title: i18n.t('approve_request.transaction_data_copied'),
                description: truncateString(txData, 20),
              })
            }
          />
        </TabContent>
      </Tabs>

      {!expanded && isScamDapp && <ThisDappIsLikelyMalicious />}
    </Box>
  );
}
