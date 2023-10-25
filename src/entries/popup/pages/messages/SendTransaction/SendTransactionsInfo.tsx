import { TransactionRequest } from '@ethersproject/abstract-provider';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useRegistryLookup } from '~/core/resources/transactions/registryLookup';
import { useCurrentCurrencyStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import {
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';
import { SymbolName } from '~/design-system/styles/designTokens';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAssetForNetwork } from '~/entries/popup/hooks/useNativeAssetForNetwork';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';

import { overflowGradient } from './OverflowGradient.css';

interface SendTransactionProps {
  request: ProviderRequestPayload;
}

function TabTrigger({
  children,
  value,
  selectedTab,
}: PropsWithChildren<{ value: string; selectedTab: string }>) {
  return (
    <Tabs.Trigger value={value} asChild>
      <Box
        tabIndex={0}
        margin="-8px"
        padding="8px"
        flexGrow="1"
        flexBasis="0"
        position="relative"
      >
        <Text align="center" size="14pt" weight="bold" color="label">
          {children}
        </Text>
        {selectedTab === value && (
          <motion.div
            layoutId="tab-selected-indicator"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '8px',
              background: 'rgba(245, 248, 255, 0.12)',
            }}
          />
        )}
      </Box>
    </Tabs.Trigger>
  );
}

function TabContent({ children, value }: PropsWithChildren<{ value: string }>) {
  return (
    <Tabs.Content value={value} asChild>
      <motion.div
        initial={{ x: 10, opacity: 0.4 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {children}
      </motion.div>
    </Tabs.Content>
  );
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

function SimulationOverview() {
  const nativeAsset = useNativeAssetForNetwork({
    chainId: ChainId.mainnet,
  });

  return (
    <Stack space="16px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        Simulated Result
      </Text>

      <Inline space="24px" alignHorizontal="justify">
        <Inline space="12px">
          <Symbol
            size={14}
            symbol="arrow.up.circle.fill"
            weight="bold"
            color="red"
          />
          <Text size="14pt" weight="bold" color="label">
            Sent
          </Text>
        </Inline>
        <Inline space="6px">
          <CoinIcon asset={nativeAsset} size={14} />
          <Text size="14pt" weight="bold" color="red">
            - 1 ETH
          </Text>
        </Inline>
      </Inline>
      <Inline space="24px" alignHorizontal="justify">
        <Inline space="12px" alignVertical="center">
          <Symbol
            size={14}
            symbol="arrow.down.circle.fill"
            weight="bold"
            color="green"
          />
          <Text size="14pt" weight="bold" color="label">
            Received
          </Text>
        </Inline>
        <Inline space="6px" alignVertical="center">
          <CoinIcon asset={nativeAsset} size={14} />
          <Text size="14pt" weight="bold" color="green">
            + 1 Blitmap
          </Text>
        </Inline>
      </Inline>

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
          <Inline space="6px" alignVertical="center">
            <Text size="12pt" weight="semibold" color="blue">
              opensea.io
            </Text>
          </Inline>
        }
      />
    </Stack>
  );
}

function TransactionDetails() {
  return (
    <Box
      style={{ maxHeight: 230 }}
      className={overflowGradient}
      marginTop="-16px"
      marginBottom="-19px"
    >
      <Box
        style={{
          maxHeight: 174,
          paddingTop: '16px',
          paddingBottom: '38px',
          overflow: 'scroll',
        }}
        gap="20px"
        display="flex"
        flexDirection="column"
      >
        <InfoRow symbol="number" label="Nonce" value={28} />
        <InfoRow
          symbol="curlybraces"
          label="Function"
          value="Fullfill Basic Order"
        />
        <InfoRow symbol="doc.plaintext" label="Contract" value="0x7be...d12b" />
        <InfoRow symbol="person" label="Contract Name" value="Seaport 1.1" />
        <InfoRow
          symbol="calendar"
          label="Contract Created"
          value="8 months ago"
        />
        <InfoRow
          symbol="doc.text.magnifyingglass"
          label="Source Code"
          value="verified"
        />
      </Box>
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

function RequestData({ request }: SendTransactionProps) {
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const nativeAsset = useNativeAssetForNetwork({
    chainId: activeSession?.chainId || ChainId.mainnet,
  });
  const { currentCurrency } = useCurrentCurrencyStore();

  const { nativeAssetAmount, nativeCurrencyAmount } = useMemo(() => {
    if (!nativeAsset)
      return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    switch (request.method) {
      case 'eth_sendTransaction':
      case 'eth_signTransaction': {
        const tx = request?.params?.[0] as RainbowTransaction;

        const nativeAssetAmount = convertRawAmountToBalance(
          tx?.value?.toString() ?? 0,
          nativeAsset,
        ).display;

        const nativeCurrencyAmount = convertRawAmountToNativeDisplay(
          tx?.value?.toString() ?? 0,
          nativeAsset?.decimals,
          nativeAsset?.price?.value as number,
          currentCurrency,
        ).display;
        return { nativeAssetAmount, nativeCurrencyAmount };
      }
      default:
        return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    }
  }, [request, nativeAsset, currentCurrency]);

  const [tab, setTab] = useState('details');

  return (
    <Stack
      space="20px"
      alignHorizontal="center"
      justifyContent="center"
      height="full"
    >
      <Tabs.Root defaultValue="details" onValueChange={setTab} asChild>
        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          padding="20px"
          background="surfaceSecondaryElevated"
          borderRadius="20px"
          borderColor="separatorSecondary"
          borderWidth="1px"
          width="full"
          height="full"
          style={{ maxHeight: 230, overflow: 'hidden' }}
        >
          <Tabs.List asChild>
            <Inline space="16px" alignVertical="center" wrap={false}>
              <TabTrigger value="overview" selectedTab={tab}>
                Overview
              </TabTrigger>
              <TabTrigger value="details" selectedTab={tab}>
                Details
              </TabTrigger>
              <TabTrigger value="data" selectedTab={tab}>
                Data
              </TabTrigger>
            </Inline>
          </Tabs.List>

          <Separator color="separatorTertiary" />

          <TabContent value="overview">
            <SimulationOverview />
          </TabContent>
          <TabContent value="details">
            <TransactionDetails />
          </TabContent>
          <TabContent value="data">
            <TransactionData data={request.params[0]?.data} />
          </TabContent>
        </Box>
      </Tabs.Root>

      {dappMetadata?.status === DAppStatus.Scam ? (
        <ThisDappIsLikelyMalicious />
      ) : null}
    </Stack>
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
              color="labelSecondary"
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
