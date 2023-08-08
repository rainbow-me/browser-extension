import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Address, useTransaction as useWagmiTransaction } from 'wagmi';

import { i18n } from '~/core/languages';
import { useTransaction } from '~/core/resources/transactions/consolidatedTransactions';
import { useCurrentAddressStore } from '~/core/state';
import { ParsedAsset } from '~/core/types/assets';
import { ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
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
import { BoxProps } from '~/design-system/components/Box/Box';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
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

const NFTIcon = ({ asset, size }: { asset: ParsedAsset; size: number }) => {
  return (
    <Box
      as="img"
      src={asset.icon_url}
      style={{ height: size, width: size }}
      borderRadius="4px"
    />
  );
};

function BaseActivityPill({
  title,
  icon,
  ...props
}: BoxProps & { title: string; icon: ReactNode }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap="6px"
      paddingHorizontal="10px"
      paddingVertical="5px"
      borderRadius="round"
      background="fillHorizontal"
      borderColor="buttonStroke"
      borderWidth="1px"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {icon}
      <Text weight="bold" color="label" size="12pt">
        {title}
      </Text>
    </Box>
  );
}
type ActivityPillProps = { transaction: RainbowTransaction };

function ActivityPill({ transaction }: ActivityPillProps) {
  const asset = transaction.asset;

  if (!asset || !transaction.title) return null;

  if (asset.type === 'nft')
    return (
      <BaseActivityPill
        icon={<NFTIcon asset={asset} size={16} />}
        title={transaction.title}
      />
    );

  if (asset.type === 'erc20')
    return (
      <BaseActivityPill
        paddingLeft="5px"
        icon={<CoinIcon asset={asset} badge={false} size={20} />}
        title={transaction.title}
      />
    );

  // if (transaction.type === TransactionType.trade)
  //   return <CoinIcon asset={asset} badge={false} size={20} />; // one on top of the other

  return null;
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

function ToFrom({ to, from }: { to: Address; from: Address }) {
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
    </Stack>
  );
}

function ConfirmationData({
  transaction,
}: {
  transaction: RainbowTransaction;
}) {
  const { data: txData } = useWagmiTransaction({
    hash: transaction.hash?.split('-')[0], // TODO
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
      {txData?.maxPriorityFeePerGas && (
        <InfoRow
          symbol="clock.badge.checkmark"
          label="Confirmed at"
          value={formatDate(txData?.timestamp)}
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
    hash: transaction.hash?.split('-')[0], // TODO
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

export function ActivityDetails() {
  const { hash } = useParams<{ hash: RainbowTransaction['hash'] }>();
  const { data: tx, isFetched } = useTransaction(hash);

  const navigate = useRainbowNavigate();

  const { currentAddress: address } = useCurrentAddressStore();

  if (!hash || (isFetched && !tx)) return <Navigate to={ROUTES.HOME} />;
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
