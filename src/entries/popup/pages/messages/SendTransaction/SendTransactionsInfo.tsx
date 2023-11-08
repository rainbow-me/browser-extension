import { TransactionRequest } from '@ethersproject/abstract-provider';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { DappMetadata, useDappMetadata } from '~/core/resources/metadata/dapp';
import { useGasStore, useNonceStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { copy } from '~/core/utils/copy';
import { toWei } from '~/core/utils/ethereum';
import { formatDate } from '~/core/utils/formatDate';
import { lessThan } from '~/core/utils/numbers';
import { truncateString } from '~/core/utils/strings';
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
import { SymbolName } from '~/design-system/styles/designTokens';
import { AddressDisplay } from '~/entries/popup/components/AddressDisplay';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { Tag } from '~/entries/popup/components/Tag';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAsset } from '~/entries/popup/hooks/useNativeAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import {
  DappHostName,
  ThisDappIsLikelyMalicious,
  getDappStatusBadge,
} from '../DappScanStatus';
import { SimulationOverview } from '../Simulation';
import { CopyButton } from '../Tabs';
import {
  SimulationError,
  TransactionSimulation
} from '../useSimulateTransaction';

interface SendTransactionProps {
  request: ProviderRequestPayload;
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
  error,
  metadata,
}: {
  simulation: TransactionSimulation | undefined;
  status: 'loading' | 'error' | 'success';
  error: SimulationError | null;
  metadata: DappMetadata | null;
}) {
  const chainId = simulation?.chainId;

  const { badge, color } = getDappStatusBadge(
    metadata?.status || DAppStatus.Unverified,
    { size: 12 },
  );

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
    <Box gap="16px" display="flex" flexDirection="column" paddingTop="14px">
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
            bleed
          >
            {isSourceCodeVerified ? i18n.t('verified') : i18n.t('unverified')}
          </Tag>
        }
      />
    </Box>
  );
}

function TransactionData({
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
}

function InsuficientGasFunds({
  address,
  chainId,
  onRejectRequest,
}: {
  address: Address;
  chainId: ChainId;
  onRejectRequest: VoidFunction;
}) {
  const chainName = ChainNameDisplay[chainId];
  const { nativeAsset } = useNativeAsset({ chainId });

  const token = `${chainName} ${nativeAsset?.symbol}`;

  const { saveSendAddress, saveSwapTokenToSell, saveSwapTokenToBuy } =
    usePopupInstanceStore();
  const navigate = useRainbowNavigate();

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
    >
      <Inline alignVertical="center" space="12px">
        <ChainBadge chainId={chainId} size={16} />
        <Text size="14pt" weight="bold">
          {i18n.t('approve_request.insufficient_gas_funds', { token })}
        </Text>
      </Inline>
      <Text size="12pt" weight="medium" color="labelQuaternary">
        {i18n.t('approve_request.insufficient_gas_funds_description', {
          token,
        })}
      </Text>
      <Stack marginHorizontal="-8px">
        <Separator color="separatorTertiary" />

        <Button
          paddingHorizontal="8px"
          height="44px"
          variant="transparent"
          color="blue"
          onClick={() => {
            if (nativeAsset) {
              // saveSwapTokenToSell({ token: nativeAsset });
              // saveSwapTokenToBuy({ token: nativeAsset });
            }
            navigate(ROUTES.BRIDGE);
            onRejectRequest();
            triggerToast({
              title: 'Transaction Request Rejected',
              description: 'Bridge some gas funds and try again',
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
              Bridge to {chainName}
            </Text>
          </Inline>
        </Button>

        <Separator color="separatorTertiary" />

        <Button
          paddingHorizontal="8px"
          height="44px"
          variant="transparent"
          color="blue"
          onClick={() => {
            saveSendAddress({ address });
            navigate(ROUTES.WALLET_SWITCHER);
            onRejectRequest();
            triggerToast({
              title: 'Transaction Request Rejected',
              description: 'Send some gas funds and try again',
            });
          }}
        >
          <Inline alignVertical="center" space="12px" wrap={false}>
            <Symbol
              size={16}
              symbol="paperplane.fill"
              color="blue"
              weight="bold"
            />
            <Text size="14pt" weight="bold" color="blue">
              Send from another wallet
            </Text>
          </Inline>
        </Button>
      </Stack>
    </Box>
  );
}
}

export const useHasEnoughtGas = (chainId: ChainId) => {
  const { nativeAsset } = useNativeAsset({ chainId });
  const { selectedGas } = useGasStore();

  return lessThan(
    selectedGas?.gasFee?.amount || '0',
    toWei(nativeAsset?.balance?.amount || '0'),
  );
};

export function SendTransactionInfo({
  request,
  onRejectRequest,
}: SendTransactionProps) {
  const dappUrl = request?.meta?.sender?.url || '';
  const { data: dappMetadata } = useDappMetadata({ url: dappUrl });

  const { activeSession } = useAppSession({ host: dappMetadata?.appHost });
  const chainId = activeSession?.chainId || ChainId.mainnet;

  const txRequest = request?.params?.[0] as TransactionRequest;

  const [expanded, setExpanded] = useState(false);

  const isScamDapp = dappMetadata?.status === DAppStatus.Scam;

  const hasEnoughtGas = useHasEnoughtGas(chainId);

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

      <AnimatePresence>
        {hasEnoughtGas ? (
          <TransactionInfo
            request={txRequest}
            dappMetadata={dappMetadata}
            dappUrl={dappUrl}
            expanded={expanded}
            onExpand={() => setExpanded((e) => !e)}
          />
        ) : (
          <InsuficientGasFunds
            chainId={chainId}
            onRejectRequest={() =>
              onRejectRequest({ preventWindowClose: true })
            }
          />
        )}
      </AnimatePresence>

      {!expanded && isScamDapp && <ThisDappIsLikelyMalicious />}
    </Box>
  );
}
