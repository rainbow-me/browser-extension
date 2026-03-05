import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, memo, useState } from 'react';
import { Address } from 'viem';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { useUserAssets } from '~/core/resources/assets';
import { DappMetadata, useDappMetadata } from '~/core/resources/metadata/dapp';
import {
  useCurrentCurrencyStore,
  useCurrentThemeStore,
  useNonceStore,
} from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getChain } from '~/core/utils/chains';
import { copy, copyAddress } from '~/core/utils/copy';
import { getFaucetsUrl } from '~/core/utils/faucets';
import { formatRelativeDate } from '~/core/utils/formatDate';
import { truncateString } from '~/core/utils/strings';
import { goToNewTab } from '~/core/utils/tabs';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { SymbolName } from '~/design-system/styles/designTokens';
import { AddressDisplay } from '~/entries/popup/components/AddressDisplay';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { Tag } from '~/entries/popup/components/Tag';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAsset } from '~/entries/popup/hooks/useNativeAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserNativeAsset } from '~/entries/popup/hooks/useUserNativeAsset';
import { ROUTES } from '~/entries/popup/urls';

import {
  DappHostName,
  MaliciousRequestWarning,
  getDappStatusBadge,
} from '../DappScanStatus';
import {
  overflowGradientDark,
  overflowGradientLight,
} from '../OverflowGradient.css';
import { SimulationOverview } from '../Simulation';
import { CopyButton, TabContent, Tabs } from '../Tabs';
import { useHasEnoughGas } from '../useHasEnoughGas';
import {
  SimulationQueryResult,
  TransactionSimulation,
} from '../useSimulateTransaction';

import {
  getChainIdForRequest,
  getSendCallsParams,
  getTransactionRequestsFromRequest,
  isWalletSendCallsRequest,
} from './normalizeRequest';

interface SendTransactionProps {
  request: ProviderRequestPayload;
  simulationResult?: SimulationQueryResult;
  onRejectRequest: ({
    preventWindowClose,
  }: {
    preventWindowClose?: boolean;
  }) => void;
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
      <Text
        color="labelTertiary"
        size="12pt"
        weight="semibold"
        whiteSpace="nowrap"
      >
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

const Overview = memo(function Overview({
  chainId,
  simulationResult,
  metadata,
}: {
  chainId: ChainId;
  simulationResult?: SimulationQueryResult;
  metadata: DappMetadata | null;
}) {
  const { badge, color } = getDappStatusBadge(
    metadata?.status || DAppStatus.Unverified,
    { size: 12 },
  );
  const chainName = getChain({ chainId }).name;

  const simulation = simulationResult?.data;
  const status =
    simulationResult?.status === 'error' && simulationResult?.isRefetching
      ? 'pending'
      : simulationResult?.status ?? 'pending';
  const error = simulationResult?.error ?? null;

  return (
    <Stack space="16px" paddingTop="14px">
      <Text size="12pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.title')}
      </Text>

      <SimulationOverview
        simulation={simulation}
        status={status}
        error={error}
      />

      <Separator color="separatorTertiary" />

      {chainId && chainName && (
        <InfoRow
          symbol="network"
          label={i18n.t('chain')}
          value={
            <Inline space="6px" alignVertical="center">
              <ChainBadge chainId={chainId} size={14} />
              <Text size="12pt" weight="semibold" color="labelSecondary">
                {chainName}
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
});

const CallDetails = memo(function CallDetails({
  meta,
  session,
  callIndex,
  isBatch,
}: {
  meta: TransactionSimulation['metas'][number];
  session: { address: Address; chainId: ChainId };
  callIndex: number;
  isBatch: boolean;
}) {
  const metaTo = meta?.to;
  const metaTransferTo = meta?.transferTo;

  const isContract = metaTo?.function || metaTo?.created;

  const functionName = metaTo?.function?.split('(')[0];
  const contract = metaTo && {
    address: metaTo.address as Address,
    name: metaTo.name,
    iconUrl: metaTo.iconURL,
  };
  const isSourceCodeVerified = metaTo?.sourceCodeStatus === 'VERIFIED';
  const contractCreatedAt = metaTo?.created;

  return (
    <Stack space="12px">
      {isBatch && (
        <Text size="12pt" weight="semibold" color="labelTertiary">
          {i18n.t('approve_request.batch_call_label', { index: callIndex })}
        </Text>
      )}
      <Box gap="16px" display="flex" flexDirection="column">
        {metaTransferTo && (
          <InfoRow
            symbol="person"
            label={i18n.t('simulation.to')}
            value={
              <AddressDisplay
                address={metaTransferTo.address as Address}
                chainId={session.chainId}
              />
            }
          />
        )}
        {contract && (
          <InfoRow
            symbol={isContract ? 'doc.plaintext' : 'person'}
            label={
              isContract
                ? i18n.t('simulation.contract')
                : i18n.t('simulation.to')
            }
            value={
              <AddressDisplay
                address={contract.address}
                contract={contract}
                chainId={session.chainId}
                color="labelSecondary"
              />
            }
          />
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
        {metaTo?.sourceCodeStatus && (
          <InfoRow
            symbol="doc.text.magnifyingglass"
            label={i18n.t('simulation.source_code')}
            value={
              <Tag
                size="12pt"
                color={isSourceCodeVerified ? 'green' : 'labelSecondary'}
                bleed
              >
                {isSourceCodeVerified
                  ? i18n.t('verified')
                  : i18n.t('unverified')}
              </Tag>
            }
          />
        )}
        {contractCreatedAt && (
          <InfoRow
            symbol="calendar"
            label={i18n.t('simulation.contract_created_at')}
            value={formatRelativeDate(contractCreatedAt)}
          />
        )}
      </Box>
    </Stack>
  );
});

const TransactionDetails = memo(function TransactionDetails({
  simulation,
  session,
}: {
  simulation: TransactionSimulation;
  session: { address: Address; chainId: ChainId };
}) {
  const nonce = useNonceStore((s) => s.getNonce(session)?.currentNonce);
  const metas = simulation.metas;

  return (
    <Box gap="16px" display="flex" flexDirection="column" paddingTop="14px">
      {metas.map((meta, index) => (
        <CallDetails
          key={index}
          meta={meta}
          session={session}
          callIndex={index + 1}
          isBatch={metas.length > 1}
        />
      ))}
      {!!nonce && metas.length <= 1 && (
        <InfoRow symbol="number" label={i18n.t('nonce')} value={nonce} />
      )}
    </Box>
  );
});

const TransactionData = memo(function TransactionData({
  data,
  expanded,
}: {
  data: string;
  expanded: boolean;
}) {
  return (
    <Box paddingBottom="32px" paddingTop="14px">
      <Text size="12pt" weight="medium" color="labelSecondary">
        <span style={{ wordWrap: 'break-word' }}>{data}</span>
      </Text>
      <CopyButton
        withLabel={expanded}
        onClick={() =>
          copy({
            value: data,
            title: i18n.t('approve_request.transaction_data_copied'),
            description: truncateString(data, 20),
          })
        }
      />
    </Box>
  );
});

const BatchTransactionData = memo(function BatchTransactionData({
  callsData,
  expanded,
}: {
  callsData: Array<{ to?: string; data: string; value?: string }>;
  expanded: boolean;
}) {
  const allDataCopyValue = callsData
    .map(
      (call, i) =>
        `${i18n.t('approve_request.batch_call_label', { index: i + 1 })}${
          call.to ? ` → ${call.to}` : ''
        }\n${call.data}`,
    )
    .join('\n\n');

  return (
    <Box paddingBottom="32px" paddingTop="14px">
      <Stack space="16px">
        {callsData.map((call, index) => (
          <Box key={index} display="flex" flexDirection="column" gap="8px">
            <Text size="12pt" weight="semibold" color="labelTertiary">
              {i18n.t('approve_request.batch_call_label', {
                index: index + 1,
              })}
              {call.to ? ` → ${truncateAddress(call.to as Address)}` : ''}
            </Text>
            <Text size="12pt" weight="medium" color="labelSecondary">
              <span style={{ wordWrap: 'break-word' }}>{call.data}</span>
            </Text>
          </Box>
        ))}
      </Stack>
      <CopyButton
        withLabel={expanded}
        onClick={() =>
          copy({
            value: allDataCopyValue,
            title: i18n.t('approve_request.transaction_data_copied'),
            description:
              callsData.length > 1
                ? i18n.t('approve_request.batch_of_calls', {
                    count: callsData.length,
                  })
                : truncateString(callsData[0]?.data ?? '', 20),
          })
        }
      />
    </Box>
  );
});

function BalanceLoadingSkeleton() {
  const { currentTheme } = useCurrentThemeStore();
  const overflowGradient =
    currentTheme === 'dark' ? overflowGradientDark : overflowGradientLight;

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="20px"
      paddingBottom="2px"
      background="surfaceSecondaryElevated"
      borderRadius="20px"
      borderColor="separatorSecondary"
      borderWidth="1px"
      width="full"
      gap="16px"
      className={overflowGradient}
      style={{
        position: 'relative',
        overflowX: 'visible',
        overflowY: 'hidden',
      }}
    >
      <Inline alignVertical="center" space="12px">
        <Skeleton width="16px" height="16px" circle />
        <Skeleton width="200px" height="16px" />
      </Inline>
      <Skeleton width="100%" height="14px" />
      <Stack marginHorizontal="-8px" space="8px">
        <Separator color="separatorTertiary" />
        <Skeleton width="100%" height="44px" />
        <Separator color="separatorTertiary" />
        <Skeleton width="100%" height="44px" />
      </Stack>
    </Box>
  );
}

function TransactionInfo({
  request,
  dappMetadata,
  expanded,
  onExpand,
  simulationResult,
}: {
  request: ProviderRequestPayload;
  dappMetadata: DappMetadata | null;
  expanded: boolean;
  onExpand: VoidFunction;
  simulationResult?: SimulationQueryResult;
}) {
  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const transactionRequests = getTransactionRequestsFromRequest(request);
  const sendParams = getSendCallsParams(request);
  const chainId = getChainIdForRequest(request, activeSession?.chainId);
  const isBatch = (transactionRequests?.length ?? 0) > 1;

  const callsData =
    sendParams?.calls.map((call) => ({
      to: call.to,
      data: call.data ?? '0x',
      value: call.value,
    })) ?? [];

  const simulation = simulationResult?.data;

  const tabLabel = (tab: string) => i18n.t(tab, { scope: 'simulation.tabs' });
  const dappBadge = dappMetadata
    ? getDappStatusBadge(dappMetadata?.status || DAppStatus.Unverified, {
        size: 12,
      })
    : null;

  return (
    <>
      <Tabs
        tabs={
          !simulation && simulationResult?.status === 'error'
            ? [tabLabel('overview'), tabLabel('data')]
            : [tabLabel('overview'), tabLabel('details'), tabLabel('data')]
        }
        expanded={expanded}
        onExpand={onExpand}
      >
        <TabContent value={tabLabel('overview')}>
          <Overview
            chainId={chainId}
            simulationResult={simulationResult}
            metadata={dappMetadata}
          />
        </TabContent>
        {simulation && (
          <TabContent value={tabLabel('details')}>
            <Stack space="16px" paddingTop="14px">
              {chainId && getChain({ chainId }).name && (
                <InfoRow
                  symbol="network"
                  label={i18n.t('chain')}
                  value={
                    <Inline space="6px" alignVertical="center">
                      <ChainBadge chainId={chainId} size={14} />
                      <Text
                        size="12pt"
                        weight="semibold"
                        color="labelSecondary"
                      >
                        {getChain({ chainId }).name}
                      </Text>
                    </Inline>
                  }
                />
              )}
              {dappMetadata && dappBadge && (
                <InfoRow
                  symbol="app.badge.checkmark"
                  label="App"
                  value={
                    <Tag
                      size="12pt"
                      color={dappBadge.color}
                      bleed
                      left={
                        dappBadge.badge && (
                          <Bleed vertical="3px">{dappBadge.badge}</Bleed>
                        )
                      }
                    >
                      {dappMetadata.appName}
                    </Tag>
                  }
                />
              )}
              <TransactionDetails
                session={activeSession!}
                simulation={simulation}
              />
            </Stack>
          </TabContent>
        )}
        <TabContent value={tabLabel('data')}>
          {isBatch ? (
            <BatchTransactionData callsData={callsData} expanded={expanded} />
          ) : (
            <TransactionData
              data={transactionRequests?.[0]?.data?.toString() ?? ''}
              expanded={expanded}
            />
          )}
        </TabContent>
      </Tabs>

      {!expanded && simulation && simulation.scanning.result !== 'OK' && (
        <MaliciousRequestWarning
          title={i18n.t('approve_request.malicious_transaction_warning.title')}
          description={simulation.scanning.description}
          symbol="exclamationmark.octagon.fill"
        />
      )}
    </>
  );
}

function InsuficientGasFunds({
  session: { chainId, address },
  onRejectRequest,
}: {
  session: { address: Address; chainId: ChainId };
  onRejectRequest: ({
    preventWindowClose,
  }: {
    preventWindowClose?: boolean;
  }) => void;
}) {
  const { testnetMode } = useTestnetModeStore();
  const isTestnet = testnetMode || getChain({ chainId }).testnet;

  const chainNativeAsset = useNativeAsset({ chainId });
  const { nativeAsset } = useUserNativeAsset({ chainId, address });
  const chainName = getChain({ chainId }).name;

  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: hasBridgeableBalance } = useUserAssets(
    { address, currency: currentCurrency },
    {
      select(data) {
        const nativeNetworks = chainNativeAsset?.networks;
        if (!nativeNetworks) return false;
        const bridgeableChains = Object.keys(nativeNetworks);
        // has a balance on any other chain we could bridge from?
        return bridgeableChains.some((chain) => {
          if (+chain === chainId) return false; // skip current chain
          const addressOnChain = nativeNetworks[+chain]?.address;
          if (!addressOnChain) return false;
          const balanceOnChain = data[+chain][addressOnChain].balance;
          return +balanceOnChain.amount > 0;
        });
      },
    },
  );

  const token = `${chainName} ${chainNativeAsset?.symbol}`;
  const faucet =
    getFaucetsUrl(chainId) ||
    'https://www.alchemy.com/list-of/crypto-faucets-on-ethereum';

  const navigate = useRainbowNavigate();

  const setSelectedToken = useSelectedTokenStore(
    (state) => state.setSelectedToken,
  );

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      display="flex"
      flexDirection="column"
      padding="20px"
      paddingBottom="2px"
      background="surfaceSecondaryElevated"
      borderRadius="20px"
      borderColor="separatorSecondary"
      borderWidth="1px"
      width="full"
      gap="16px"
    >
      <Inline alignVertical="center" space="12px">
        <ChainBadge chainId={chainId} size={16} />
        <Text size="14pt" weight="bold">
          {nativeAsset && +nativeAsset.balance.amount > 0
            ? i18n.t('approve_request.insufficient_gas_funds', { token })
            : i18n.t('approve_request.no_gas_funds', { token })}
        </Text>
      </Inline>
      <Text size="12pt" weight="medium" color="labelQuaternary">
        {nativeAsset && +nativeAsset.balance.amount > 0
          ? i18n.t('approve_request.insufficient_gas_funds_description', {
              token,
            })
          : i18n.t('approve_request.no_gas_funds_description', {
              token,
            })}
      </Text>
      <Stack marginHorizontal="-8px">
        <Separator color="separatorTertiary" />

        {hasBridgeableBalance && nativeAsset && (
          <Button
            paddingHorizontal="8px"
            height="44px"
            variant="transparent"
            color="blue"
            onClick={() => {
              setSelectedToken(nativeAsset);
              navigate(ROUTES.BRIDGE, { replace: true });
              onRejectRequest({ preventWindowClose: true });
              triggerToast({
                title: i18n.t('approve_request.request_rejected'),
                description: i18n.t('approve_request.bridge_and_try_again'),
              });
            }}
          >
            <Inline alignVertical="center" space="12px" wrap={false}>
              <Symbol
                size={16}
                symbol="arrow.turn.up.right"
                color="blue"
                weight="bold"
              />
              <Text size="14pt" weight="bold" color="blue">
                {i18n.t('approve_request.bridge_to', { chain: chainName })}
              </Text>
            </Inline>
          </Button>
        )}
        {!hasBridgeableBalance && !isTestnet && (
          <Button
            paddingHorizontal="8px"
            height="44px"
            variant="transparent"
            color="blue"
            onClick={() => {
              navigate(ROUTES.BUY, { replace: true });
              onRejectRequest({ preventWindowClose: true });
              triggerToast({
                title: i18n.t('approve_request.request_rejected'),
                description: i18n.t('approve_request.buy_and_try_again'),
              });
            }}
          >
            <Inline alignVertical="center" space="12px" wrap={false}>
              <Symbol
                size={16}
                symbol="creditcard.fill"
                color="blue"
                weight="bold"
              />
              <Text size="14pt" weight="bold" color="blue">
                {i18n.t('approve_request.buy_gas', { token })}
              </Text>
            </Inline>
          </Button>
        )}
        {!hasBridgeableBalance && isTestnet && (
          <Button
            paddingHorizontal="8px"
            height="44px"
            variant="transparent"
            color="blue"
            onClick={() => {
              onRejectRequest({ preventWindowClose: false });
              goToNewTab({ url: faucet });
            }}
          >
            <Inline alignVertical="center" space="12px" wrap={false}>
              <Symbol
                size={16}
                symbol="spigot.fill"
                color="blue"
                weight="bold"
              />
              <Text size="14pt" weight="bold" color="blue">
                {i18n.t('approve_request.get_testnet_gas', {
                  token: nativeAsset?.symbol,
                })}
              </Text>
            </Inline>
          </Button>
        )}

        <Separator color="separatorTertiary" />

        <Button
          paddingHorizontal="8px"
          height="44px"
          variant="transparent"
          color="blue"
          onClick={() => copyAddress(address)}
        >
          <Inline alignVertical="center" space="12px" wrap={false}>
            <Symbol
              size={16}
              symbol="square.on.square"
              color="blue"
              weight="bold"
            />
            <Text size="14pt" weight="bold" color="blue">
              {i18n.t('approve_request.copy_deposit_address')}
            </Text>
          </Inline>
        </Button>
      </Stack>
    </Box>
  );
}

export function SendTransactionInfo({
  request,
  simulationResult,
  onRejectRequest,
}: SendTransactionProps) {
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });

  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });

  const isBatch = isWalletSendCallsRequest(request);
  const sendParams = getSendCallsParams(request);

  const [expanded, setExpanded] = useState(false);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;

  const { hasEnough: hasEnoughGas, isLoading: isGasLoading } =
    useHasEnoughGas(activeSession);

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
                <DappHostName
                  hostName={dappMetadata?.appHostName}
                  dappStatus={dappMetadata?.status}
                />
                {isScamDapp ? (
                  <Text align="center" size="14pt" weight="bold" color="red">
                    {i18n.t('approve_request.dangerous_request')}
                  </Text>
                ) : isBatch && sendParams?.chainId ? (
                  <Inline
                    alignVertical="center"
                    alignHorizontal="center"
                    space="6px"
                    wrap
                  >
                    <Text size="14pt" weight="bold" color="labelSecondary">
                      {i18n.t('approve_request.batch_request_title', {
                        count: sendParams?.calls?.length ?? 0,
                      })}
                    </Text>
                    {(() => {
                      const chainId = Number(sendParams.chainId);
                      const chain = getChain({ chainId });
                      return chain?.name ? (
                        <Inline alignVertical="center" space="6px" wrap={false}>
                          <ChainBadge chainId={chainId} size={14} />
                          <Text
                            size="14pt"
                            weight="bold"
                            color="labelSecondary"
                          >
                            {chain.name}
                          </Text>
                        </Inline>
                      ) : (
                        <Text size="14pt" weight="bold" color="labelSecondary">
                          {i18n.t(
                            'approve_request.batch_request_chain_unknown',
                            { chainId },
                          )}
                        </Text>
                      );
                    })()}
                  </Inline>
                ) : isBatch ? (
                  <Text
                    align="center"
                    size="14pt"
                    weight="bold"
                    color="labelSecondary"
                  >
                    {i18n.t('approve_request.batch_request_title', {
                      count: sendParams?.calls?.length ?? 0,
                    })}{' '}
                    {i18n.t('approve_request.batch_request_chain_unknown', {
                      chainId: '?',
                    })}
                  </Text>
                ) : (
                  <Text
                    align="center"
                    size="14pt"
                    weight="bold"
                    color="labelSecondary"
                  >
                    {i18n.t('approve_request.transaction_request')}
                  </Text>
                )}
              </Stack>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Show loading skeleton while balance is being fetched */}
      {isGasLoading ? (
        <BalanceLoadingSkeleton />
      ) : /* Show insufficient funds if user doesn't have enough gas */ hasEnoughGas ===
        false ? (
        activeSession && (
          <InsuficientGasFunds
            session={activeSession}
            onRejectRequest={onRejectRequest}
          />
        )
      ) : getTransactionRequestsFromRequest(request) ? (
        <TransactionInfo
          request={request}
          dappMetadata={dappMetadata}
          expanded={expanded}
          onExpand={() => setExpanded((e) => !e)}
          simulationResult={simulationResult}
        />
      ) : null}
    </Box>
  );
}
