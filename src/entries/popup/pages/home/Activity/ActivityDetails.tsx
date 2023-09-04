import { formatEther, formatUnits } from '@ethersproject/units';
import { Navigate, useParams } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { SUPPORTED_CHAIN_IDS } from '~/core/utils/chains';
import { formatDate } from '~/core/utils/formatDate';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Bleed,
  Box,
  Button,
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

import { SpeedUpAndCancelSheet } from '../../speedUpAndCancelSheet';
import { CopyableValue, InfoRow } from '../TokenDetails/About';

import { ActivityPill } from './ActivityPill';
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
  const isMined = transaction.status !== 'pending';

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
      {isMined && (
        <>
          <InfoRow
            symbol="clock.badge.checkmark"
            label="Confirmed at"
            value={formatDate(transaction.minedAt * 1000)}
          />
          <InfoRow
            symbol="number.square"
            label="Block"
            value={
              <Inline alignVertical="center" space="4px">
                {transaction.blockNumber}
                {transaction.confirmations && (
                  <Text size="12pt" weight="semibold" color="labelQuaternary">
                    {transaction.confirmations} Confirmations
                  </Text>
                )}
              </Inline>
            }
          />
        </>
      )}
    </Stack>
  );
}

function NetworkData({ transaction }: { transaction: RainbowTransaction }) {
  const { maxPriorityFeePerGas, maxFeePerGas, fee, nonce } = transaction;

  const value = transaction.value && formatEther(transaction.value);
  const minerTip =
    maxPriorityFeePerGas && formatUnits(maxPriorityFeePerGas, 'gwei');
  const maxBaseFee = maxFeePerGas && formatUnits(maxFeePerGas, 'gwei');

  return (
    <Stack space="24px">
      {value && (
        <InfoRow
          symbol="dollarsign.square"
          label="Value"
          value={`${formatNumber(value)} ETH`}
        />
      )}
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
      {fee && (
        <InfoRow
          symbol="fuelpump.fill"
          label="Network Fee"
          value={formatCurrency(fee)}
        />
      )}
      {maxBaseFee && (
        <InfoRow
          symbol="barometer"
          label="Max Base Fee"
          value={`${formatNumber(maxBaseFee)} Gwei`}
        />
      )}
      {minerTip && (
        <InfoRow
          symbol="barometer"
          label="Miner Tip"
          value={`${formatNumber(minerTip)} Gwei`}
        />
      )}
      {nonce >= 0 && <InfoRow symbol="number" label="Nonce" value={nonce} />}
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

const SpeedUpOrCancel = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Button
        onClick={() => setCurrentHomeSheet('speedUp')}
        symbol="bolt.fill"
        height="32px"
        width="full"
        variant="plain"
        color="blue"
      >
        {i18n.t('speed_up_and_cancel.speed_up')}
      </Button>
      <Button
        onClick={() => setCurrentHomeSheet('cancel')}
        symbol="trash.fill"
        height="32px"
        width="full"
        variant="plain"
        color="fillSecondary"
      >
        {i18n.t('speed_up_and_cancel.cancel')}
      </Button>
      {sheet !== 'none' && (
        <SpeedUpAndCancelSheet
          currentSheet={sheet}
          transaction={transaction}
          onClose={() => setCurrentHomeSheet('none')}
        />
      )}
    </Box>
  );
};

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
              navigate(ROUTES.HOME, { state: { skipPageTransition: true } })
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
        {tx.status === 'pending' && (
          <>
            <Separator color="separatorTertiary" />
            <SpeedUpOrCancel transaction={tx} />
          </>
        )}
      </Box>
    </BottomSheet>
  );
}
