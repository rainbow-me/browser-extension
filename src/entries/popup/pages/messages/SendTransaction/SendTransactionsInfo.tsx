import { TransactionRequest } from '@ethersproject/abstract-provider';
import { PropsWithChildren, ReactNode, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useRegistryLookup } from '~/core/resources/transactions/registryLookup';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  Bleed,
  Box,
  Inline,
  Inset,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolName, globalColors } from '~/design-system/styles/designTokens';
import { AddressDisplay } from '~/entries/popup/components/AddressDisplay';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { Tag } from '~/entries/popup/components/Tag';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAssetForNetwork } from '~/entries/popup/hooks/useNativeAssetForNetwork';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { TabContent, Tabs, TabsNav } from '../Tabs';

import { overflowGradient } from './OverflowGradient.css';

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
    gap="4px"
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

function SimulatedChangeRow({
  direction,
  asset,
}: {
  direction: 'in' | 'out' | 'self';
  asset: ParsedAsset;
}) {
  const color = direction === 'in' ? 'green' : 'red';
  const icon =
    direction === 'in' ? 'arrow.down.circle.fill' : 'arrow.up.circle.fill';
  const label = direction === 'in' ? 'Received' : 'Sent';
  return (
    <Inline space="24px" alignHorizontal="justify" alignVertical="center">
      <Inline space="12px" alignVertical="center">
        <Symbol size={14} symbol={icon} weight="bold" color={color} />
        <Text size="14pt" weight="bold" color="label">
          {label}
        </Text>
      </Inline>
      <Inline space="6px" alignVertical="center">
        <CoinIcon asset={asset} size={14} />
        <Text size="14pt" weight="bold" color={color}>
          - 1 {asset.symbol}
        </Text>
      </Inline>
    </Inline>
  );
}

function SimulationOverview() {
  const nativeAsset = useNativeAssetForNetwork({
    chainId: ChainId.mainnet,
  });

  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        Simulated Result
      </Text>

      {nativeAsset && (
        <Stack space="14px">
          <SimulatedChangeRow asset={nativeAsset} direction="out" />
          {/* <SimulatedChangeRow asset={nativeAsset} direction="out" />
          <SimulatedChangeRow asset={nativeAsset} direction="out" />
          <SimulatedChangeRow asset={nativeAsset} direction="out" />
          <SimulatedChangeRow asset={nativeAsset} direction="out" /> */}
        </Stack>
      )}

      <Separator color="separatorTertiary" />

      <InfoRow
        symbol="network"
        label="Chain"
        value={
          <Inline space="6px" alignVertical="center">
            <ChainBadge chainId={1} size={14} />
            <Text size="12pt" weight="semibold" color="labelSecondary">
              ETH
            </Text>
          </Inline>
        }
      />

      <InfoRow
        symbol="app.badge.checkmark"
        label="App"
        value={
          <Tag
            size="12pt"
            color="blue"
            style={{ borderColor: globalColors.blueA10 }}
            bleed
            left={
              <Bleed vertical="3px">
                <Symbol
                  symbol="checkmark.seal.fill"
                  size={11}
                  weight="bold"
                  color="blue"
                />
              </Bleed>
            }
          >
            opensea.io
          </Tag>
        }
      />
    </Stack>
  );
}

function TransactionDetails() {
  return (
    <Box gap="16px" display="flex" flexDirection="column">
      <InfoRow symbol="number" label="Nonce" value={28} />
      <InfoRow
        symbol="curlybraces"
        label="Function"
        value={
          <Tag size="12pt" color="labelSecondary" bleed>
            Fullfill Basic Order
          </Tag>
        }
      />
      <InfoRow
        symbol="doc.plaintext"
        label="Contract"
        value={
          <AddressDisplay
            address="0x507F0daA42b215273B8a063B092ff3b6d27767aF"
            hideAvatar
          />
        }
      />
      <InfoRow symbol="person" label="Contract Name" value="Seaport 1.1" />
      <InfoRow
        symbol="calendar"
        label="Contract Created"
        value="8 months ago"
      />
      <InfoRow
        symbol="doc.text.magnifyingglass"
        label="Source Code"
        value={
          <Tag
            size="12pt"
            color="green"
            style={{ borderColor: globalColors.greenA10 }}
            bleed
          >
            Verified
          </Tag>
        }
      />
    </Box>
  );
}

function TransactionData({ data }: { data: string }) {
  return (
    <Box
      style={{ maxHeight: 230 }}
      className={overflowGradient}
      marginTop="-16px"
      marginBottom="-20px"
    >
      <Box
        style={{
          maxHeight: 174,
          paddingTop: '16px',
          paddingBottom: '38px',
          overflow: 'scroll',
        }}
      >
        <Text size="12pt" weight="medium" color="labelSecondary">
          <span style={{ wordWrap: 'break-word' }}>{data}</span>
        </Text>
      </Box>
    </Box>
  );
}

export function ExpandableScrollAreaWithGradient({
  children,
  tab,
}: PropsWithChildren<{ tab: string }>) {
  const [hasViewMore, setHasViewMore] = useState(false);

  return (
    <>
      <Box
        className={hasViewMore ? overflowGradient : undefined}
        position="relative"
        style={{ overflowX: 'visible', overflowY: 'hidden' }}
        marginBottom="-20px"
        marginHorizontal="-20px"
        paddingHorizontal="20px"
      >
        <Box
          style={{
            maxHeight: '100%',
            paddingBottom: hasViewMore ? '38px' : '20px',
            overflow: hasViewMore ? 'scroll' : 'visible',
          }}
          paddingTop="14px"
          paddingHorizontal="20px"
          marginHorizontal="-20px"
          gap="16px"
          display="flex"
          flexDirection="column"
          key={tab}
          ref={(e) => {
            if (!e) return;
            setHasViewMore(e.scrollHeight > e.clientHeight);
          }}
        >
          {children}
        </Box>
      </Box>
      {hasViewMore && (
        <Box
          as="button"
          position="absolute"
          style={{ height: '28px', width: '28px', bottom: 12, right: 12 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="fillSecondary"
          backdropFilter="blur(10px)"
          boxShadow="12px"
          borderRadius="8px"
          borderWidth="1px"
          borderColor="separatorSecondary"
          // onClick={() => setExpanded((e) => !e)}
        >
          <Symbol
            symbol="arrow.up.left.and.arrow.down.right"
            size={12}
            color="labelSecondary"
            weight="bold"
          />
        </Box>
      )}
    </>
  );
}

function RequestData({ request }: SendTransactionProps) {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState('Overview');

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="20px"
      alignItems="center"
      height="full"
      style={{ overflow: expanded ? 'scroll' : 'hidden', height: '100%' }}
    >
      <Tabs tabs={['Overview', 'Details', 'Data']} tab={tab} setTab={setTab}>
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
          style={{ maxHeight: expanded ? 540 : 230, overflow: 'hidden' }}
        >
          <TabsNav />
          <Inset top="20px">
            <Separator color="separatorTertiary" />
          </Inset>
          <ExpandableScrollAreaWithGradient key={tab} tab={tab}>
            <TabContent value="Overview">
              <SimulationOverview />
            </TabContent>
            <TabContent value="Details">
              <TransactionDetails />
            </TabContent>
            <TabContent value="Data">
              <TransactionData data={request.params[0]?.data} />
            </TabContent>
          </ExpandableScrollAreaWithGradient>
        </Box>
      </Tabs>

      {dappMetadata?.status === DAppStatus.Scam ? (
        <ThisDappIsLikelyMalicious />
      ) : null}
    </Box>
  );
}

export function SendTransactionInfo({ request }: SendTransactionProps) {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const txRequest = request?.params?.[0] as TransactionRequest;

  const { data: methodName = '' } = useRegistryLookup({
    data: (txRequest?.data as string) || null,
    to: txRequest?.to || null,
    chainId: activeSession?.chainId || ChainId.mainnet,
    hash: null,
  });

  // dappMetadata.status = DAppStatus.Scam;
  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;

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
              {methodName}
            </Text>
          </Stack>
        </Stack>
        <RequestData request={request} />
      </Stack>
    </Box>
  );
}
