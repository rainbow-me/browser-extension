import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Address, useTransaction as useWagmiTransaction } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { SUPPORTED_CHAIN_IDS } from '~/core/utils/chains';
import { formatDate } from '~/core/utils/formatDate';
import { formatNumber } from '~/core/utils/formatNumber';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Bleed,
  Box,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { CopyableValue, InfoRow } from '../TokenDetails/About';

import { ActivityIcon } from './ActivityIcon';
import { pendingStyle } from './ActivityPill.css';
import { useTransaction } from './useTransaction';

function AddressMoreOptions({ address }: { address: Address }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Bleed space="9px">
          <ButtonSymbol
            symbol="ellipsis.circle"
            height="32px"
            variant="transparent"
            color="labelTertiary"
          />
        </Bleed>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          symbolLeft="doc.on.doc.fill"
          onSelect={() => {
            navigator.clipboard.writeText(address);
            triggerToast({
              title: i18n.t('wallet_header.copy_toast'),
              description: truncateAddress(address),
            });
          }}
        >
          <Stack space="8px">
            <Text size="14pt" weight="semibold">
              {i18n.t('token_details.more_options.copy_address')}
            </Text>
            <Text size="11pt" color="labelTertiary" weight="medium">
              {truncateAddress(address)}
            </Text>
          </Stack>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const statusColor = {
  pending: 'blue',
  failed: 'red',
  confirmed: 'label',
} as const;

const AA = ({ width }: { width: number }) => {
  return (
    <svg height="40" width={width + 4}>
      <rect
        width={width}
        height="36"
        fill="transparent"
        stroke="#F5F8FF1F"
        strokeWidth="2"
        ry="20" // fix roundness
        rx="20" // fix roundness
        x="2"
        y="2"
      />
      <rect
        width={width}
        height="36"
        fill="transparent"
        stroke="#2775CA"
        strokeWidth="2"
        ry="20" // fix roundness
        rx="20" // fix roundness
        x="2"
        y="2"
        className={pendingStyle}
      />
    </svg>
  );
};

function ActivityPill({ transaction }: { transaction: RainbowTransaction }) {
  const { status, title } = transaction;
  const color = statusColor[status];

  const [width, setWidth] = useState(0);

  return (
    <Box position="relative">
      <Box position="absolute" style={{ top: -6, left: -6 }}>
        {width && <AA width={width + 4} />}
      </Box>
      <Box
        ref={(n) => {
          if (n) setWidth(n.clientWidth);
        }}
        display="flex"
        alignItems="center"
        gap="6px"
        paddingHorizontal="10px"
        paddingVertical="5px"
        borderRadius="round"
        background="fillHorizontal"
        borderColor={status === 'failed' ? 'red' : 'buttonStroke'}
        borderWidth="1px"
      >
        <ActivityIcon transaction={transaction} size={16} badge={false} />
        <Text weight="bold" color={color} size="12pt">
          {title}
        </Text>
      </Box>
    </Box>
  );
}

const YouOrAddress = ({ address }: { address: Address }) => {
  const currentAccount = useCurrentAddressStore((a) =>
    a.currentAddress.toLocaleLowerCase(),
  );
  if (currentAccount === address.toLowerCase())
    return (
      <>
        {i18n.t('activity_details.you')}
        <Text size="12pt" weight="semibold" color="labelQuaternary">
          <Inline alignVertical="center">
            (
            <AddressOrEns
              address={address}
              size="12pt"
              weight="semibold"
              color="labelQuaternary"
            />
            )
          </Inline>
        </Text>
      </>
    );

  return (
    <AddressOrEns
      address={address}
      size="12pt"
      weight="semibold"
      color="labelQuaternary"
    />
  );
};

function ToFrom({
  to,
  from,
}: {
  to?: Address; // may not have a to when it's a contract deployment
  from: Address;
}) {
  return (
    <Stack space="24px">
      <InfoRow
        symbol="arrow.down.circle"
        label="From"
        value={
          <Inline space="6px" alignVertical="center">
            <WalletAvatar address={from} size={16} emojiSize="9pt" />
            <YouOrAddress address={from} />
            <AddressMoreOptions address={from} />
          </Inline>
        }
      />
      {to && (
        <InfoRow
          symbol="paperplane.fill"
          label="To"
          value={
            <Inline space="6px" alignVertical="center">
              <WalletAvatar address={to} size={16} emojiSize="9pt" />
              <YouOrAddress address={to} />
              <AddressMoreOptions address={to} />
            </Inline>
          }
        />
      )}
    </Stack>
  );
}

function ConfirmationData({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const { data: txData } = useWagmiTransaction({
    hash: transaction.hash,
    chainId: transaction.chainId,
  });
  return (
    <Stack space="24px">
      <InfoRow
        symbol="number"
        label="TxHash"
        value={
          <CopyableValue title={'Hash Copied'} value={transaction.hash}>
            {truncateAddress(transaction.hash)}
          </CopyableValue>
        }
      />
      {txData?.timestamp && (
        <InfoRow
          symbol="clock.badge.checkmark"
          label="Confirmed at"
          value={formatDate(txData.timestamp)}
        />
      )}
      {/* <InfoRow
          symbol="clock"
          label="Time to Confirmation"
          value={formatDate(transaction.minedAt)}
        /> */}
      <InfoRow
        symbol="number.square"
        label="Block"
        value={
          <Inline alignVertical="center" space="4px">
            {txData?.blockNumber}
            <Text size="12pt" weight="semibold" color="labelQuaternary">
              {txData?.confirmations} Confirmations
            </Text>
          </Inline>
        }
      />
    </Stack>
  );
}

function NetworkData({ transaction }: { transaction: RainbowTransaction }) {
  const { data: txData } = useWagmiTransaction({
    hash: transaction.hash,
    chainId: transaction.chainId,
  });

  const maxPriorityFeePerGas = txData?.maxPriorityFeePerGas?.div(10 ** 9);
  const gasPrice = txData?.gasPrice?.div(10 ** 9);

  return (
    <Stack space="24px">
      <InfoRow
        symbol="dollarsign.square"
        label="Value"
        value={formatNumber(transaction.value?.toString())}
      />
      <InfoRow
        symbol="point.3.filled.connected.trianglepath.dotted"
        label="Network"
        value={
          <Inline alignVertical="center" space="4px">
            <ChainBadge chainId={transaction.chainId} size={12} />
            {ChainNameDisplay[transaction.chainId]}
          </Inline>
        }
      />
      {/* <InfoRow
        symbol="fuelpump.fill"
        label="Network Fee"
        value={`${formatNumber(transaction.maxFeePerGas?.toString())}`}
      /> */}
      {gasPrice && maxPriorityFeePerGas && (
        <InfoRow
          symbol="barometer"
          label="Base Fee"
          value={`${formatNumber(
            gasPrice.sub(maxPriorityFeePerGas).toString(),
          )} Gwei`}
        />
      )}
      {maxPriorityFeePerGas && (
        <InfoRow
          symbol="barometer"
          label="Miner Tip"
          value={`${formatNumber(maxPriorityFeePerGas?.toString())} Gwei`}
        />
      )}
      <InfoRow symbol="number" label="Nonce" value={transaction.nonce} />
    </Stack>
  );
}

const isSupportedChain = (chainId?: number | string): chainId is ChainId =>
  SUPPORTED_CHAIN_IDS.includes(Number(chainId));

export function ActivityDetails() {
  const { hash, chainId } = useParams<{
    hash: `0x${string}`;
    chainId: string;
  }>();

  if (!isSupportedChain(chainId) || !hash) return <Navigate to={ROUTES.HOME} />;

  return <ActivityDetailsSheet hash={hash} chainId={chainId} />;
}

function ActivityDetailsSheet({
  hash,
  chainId,
}: {
  hash: `0x${string}`;
  chainId: ChainId;
}) {
  const { data: tx, isFetched } = useTransaction({ hash, chainId });

  const navigate = useRainbowNavigate();

  if (isFetched && !tx) return <Navigate to={ROUTES.HOME} />;
  if (!tx) return null;

  return (
    <BottomSheet show>
      <Navbar
        leftComponent={
          <Navbar.CloseButton
            onClick={() =>
              navigate(ROUTES.HOME, { state: { activeTab: 'activity' } })
            }
          />
        }
        titleComponent={<ActivityPill transaction={tx} />}
        rightComponent={
          <Inline alignVertical="center" space="7px">
            <ButtonSymbol
              symbol="ellipsis"
              height="32px"
              variant="transparentHover"
              color="labelSecondary"
            />
          </Inline>
        }
      />
      <Separator color="separatorTertiary" />

      <Box padding="20px" display="flex" flexDirection="column" gap="20px">
        <ToFrom to={tx.to} from={tx.from} />
        <Separator color="separatorTertiary" />
        <ConfirmationData transaction={tx} />
        <Separator color="separatorTertiary" />
        <NetworkData transaction={tx} />
      </Box>
    </BottomSheet>
  );
}
