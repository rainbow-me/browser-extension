import { AddressZero } from '@ethersproject/constants';
import { formatEther, formatUnits } from '@ethersproject/units';
import { Navigate, useParams } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { SUPPORTED_CHAIN_IDS } from '~/core/utils/chains';
import { formatDate } from '~/core/utils/formatDate';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { truncateString } from '~/core/utils/strings';
import {
  getBlockExplorerName,
  getTransactionBlockExplorerUrl,
} from '~/core/utils/transactions';
import {
  Bleed,
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  CoinIcon,
  ContractIcon,
} from '~/entries/popup/components/CoinIcon/CoinIcon';
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

const AddressDisplay = ({ address }: { address: Address }) => {
  return (
    <Inline space="6px" alignVertical="center">
      <WalletAvatar address={address} size={16} emojiSize="9pt" />
      <YouOrAddress address={address} />
      <AddressMoreOptions address={address} />
    </Inline>
  );
};

const ContractDisplay = ({
  address,
  contract: { name, iconUrl },
}: {
  address: Address;
  contract: {
    name: string;
    iconUrl?: string;
  };
}) => {
  if (!name) return <AddressDisplay address={address} />;
  return (
    <Inline space="6px" alignVertical="center">
      {iconUrl ? (
        <ContractIcon size={16} iconUrl={iconUrl} />
      ) : (
        <WalletAvatar address={address} size={16} emojiSize="9pt" />
      )}
      <TextOverflow size="12pt" weight="semibold" color="labelQuaternary">
        {name}
      </TextOverflow>
      <AddressMoreOptions address={address} />
    </Inline>
  );
};

function ToFrom({ transaction }: { transaction: RainbowTransaction }) {
  const { from, to, contract, direction } = transaction;
  const isFromAContract = !!contract && direction === 'in';
  const isToAContract = !!contract && direction === 'out';

  return (
    <Stack space="24px">
      <InfoRow
        symbol="arrow.down.circle"
        label={i18n.t('activity_details.from')}
        value={
          isFromAContract ? (
            <ContractDisplay address={from} contract={contract} />
          ) : (
            <AddressDisplay address={from} />
          )
        }
      />
      {to && (
        <InfoRow
          symbol="paperplane.fill"
          label={i18n.t('activity_details.to')}
          value={
            isToAContract ? (
              <ContractDisplay address={to} contract={contract} />
            ) : (
              <AddressDisplay address={to} />
            )
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
          <CopyableValue
            title={i18n.t('activity_details.hash_copied')}
            value={transaction.hash}
          >
            {truncateString(transaction.hash, 18)}
          </CopyableValue>
        }
      />
      {isMined && (
        <>
          <InfoRow
            symbol="clock.badge.checkmark"
            label={i18n.t('activity_details.confirmed_at')}
            value={formatDate(transaction.minedAt * 1000)}
          />
          <InfoRow
            symbol="number.square"
            label={i18n.t('activity_details.block')}
            value={
              <Inline alignVertical="center" space="4px">
                {transaction.blockNumber}
                {transaction.confirmations && (
                  <Text size="12pt" weight="semibold" color="labelQuaternary">
                    {formatNumber(transaction.confirmations, {
                      notation: 'compact',
                    })}{' '}
                    Confirmations
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
  const { maxPriorityFeePerGas, maxFeePerGas, fee, nonce, changes } =
    transaction;

  const value = transaction.value && formatEther(transaction.value);
  const nativeAssetSymbol = changes?.find((c) => c?.asset.isNativeAsset)?.asset
    .symbol;
  const minerTip =
    maxPriorityFeePerGas && formatUnits(maxPriorityFeePerGas, 'gwei');
  const maxBaseFee = maxFeePerGas && formatUnits(maxFeePerGas, 'gwei');

  return (
    <Stack space="24px">
      {value && nativeAssetSymbol && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.value')}
          value={`${formatNumber(value)} ${nativeAssetSymbol}`}
        />
      )}
      <InfoRow
        symbol="point.3.filled.connected.trianglepath.dotted"
        label={i18n.t('activity_details.network')}
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
          label={i18n.t('activity_details.fee')}
          value={formatCurrency(fee)}
        />
      )}
      {maxBaseFee && (
        <InfoRow
          symbol="barometer"
          label={i18n.t('activity_details.max_base_fee')}
          value={`${formatNumber(maxBaseFee)} Gwei`}
        />
      )}
      {minerTip && (
        <InfoRow
          symbol="barometer"
          label={i18n.t('activity_details.max_priority_fee')}
          value={`${formatNumber(minerTip)} Gwei`}
        />
      )}
      {nonce >= 0 && (
        <InfoRow
          symbol="number"
          label={i18n.t('activity_details.nonce')}
          value={nonce}
        />
      )}
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

const getExchangeRate = ({ type, changes }: RainbowTransaction) => {
  if (type !== 'swap') return;

  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;

  const amountIn = tokenIn?.balance.amount;
  const amountOut = tokenOut?.balance.amount;

  if (!amountIn || !amountOut) return;

  const rate = +amountIn / +amountOut;
  if (!rate) return;

  return `1 ${tokenIn.symbol} ≈ ${formatNumber(rate)} ${tokenOut.symbol}`;
};

type TxAdditionalDetails = {
  asset?: ParsedAsset;
  tokenAmount?: string;
  tokenContract?: Address;
  exchangeRate?: string;
  collection?: string;
  standard?: ParsedAsset['standard'];
};
const getAdditionalDetails = (transaction: RainbowTransaction) => {
  const exchangeRate = getExchangeRate(transaction);
  const { asset, changes } = transaction;
  const nft = changes?.find((c) => c?.asset.type === 'nft')?.asset;
  const collection = nft?.symbol;
  const standard = nft?.standard;
  const tokenContract =
    asset?.address !== ETH_ADDRESS && asset?.address !== AddressZero
      ? asset?.address
      : undefined;

  const tokenAmount =
    !nft && tokenContract
      ? changes?.find((c) => c?.asset.address === tokenContract)?.asset.balance
          .amount
      : undefined;

  if (
    !tokenAmount &&
    !tokenContract &&
    !exchangeRate &&
    !collection &&
    !standard
  )
    return;

  return {
    asset,
    tokenAmount: tokenAmount && `${formatNumber(tokenAmount)} ${asset?.symbol}`,
    tokenContract,
    exchangeRate,
    collection,
    standard,
  } satisfies TxAdditionalDetails;
};

const AdditionalDetails = ({ details }: { details: TxAdditionalDetails }) => {
  const {
    asset,
    tokenAmount,
    tokenContract,
    exchangeRate,
    collection,
    standard,
  } = details;
  return (
    <Stack space="24px">
      {tokenAmount && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.token')}
          value={
            <Inline alignVertical="center" space="4px">
              <CoinIcon asset={asset} badge={false} size={16} />
              {tokenAmount}
            </Inline>
          }
        />
      )}
      {exchangeRate && (
        <InfoRow
          symbol="arrow.2.squarepath"
          label={i18n.t('activity_details.exchange_rate')}
          value={exchangeRate}
        />
      )}
      {collection && (
        <InfoRow
          symbol="square.grid.2x2"
          label={i18n.t('activity_details.collection')}
          value={collection}
        />
      )}
      {tokenContract && (
        <InfoRow
          symbol="doc.plaintext"
          label={i18n.t('activity_details.token_contract')}
          value={
            <CopyableValue
              title={i18n.t('wallet_header.copy_toast')}
              value={tokenContract}
            >
              {truncateAddress(tokenContract)}
            </CopyableValue>
          }
        />
      )}
      {standard && (
        <InfoRow
          symbol="info.circle"
          label={i18n.t('activity_details.token_standard')}
          value={standard.toUpperCase()}
        />
      )}
    </Stack>
  );
};

function MoreOptions({ transaction }: { transaction: RainbowTransaction }) {
  const explorerHost = getBlockExplorerName(transaction.chainId);
  const explorerUrl = getTransactionBlockExplorerUrl(transaction);
  const hash = transaction.hash;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <ButtonSymbol
            symbol="ellipsis"
            height="32px"
            variant="transparentHover"
            color="labelSecondary"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          symbolLeft="doc.on.doc.fill"
          onSelect={() => {
            navigator.clipboard.writeText(hash);
            triggerToast({
              title: i18n.t('activity_details.hash_copied'),
              description: truncateString(hash, 18),
            });
          }}
        >
          <Stack space="8px">
            <Text size="14pt" weight="semibold">
              {i18n.t('activity_details.copy_hash')}
            </Text>
            <Text size="11pt" color="labelTertiary" weight="medium">
              {truncateString(hash, 18)}
            </Text>
          </Stack>
        </DropdownMenuItem>
        {explorerUrl && (
          <DropdownMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => {
              navigator.clipboard.writeText(explorerUrl);
              triggerToast({
                title: i18n.t('activity_details.explorer_copied'),
                description: truncateString(explorerUrl, 18),
              });
            }}
          >
            <Stack space="8px">
              <Text size="14pt" weight="semibold">
                {i18n.t('activity_details.copy_explorer_url')}
              </Text>
              <Text size="11pt" color="labelTertiary" weight="medium">
                {truncateString(explorerUrl, 18)}
              </Text>
            </Stack>
          </DropdownMenuItem>
        )}
        <Box paddingVertical="4px">
          <Separator color="separatorSecondary" />
        </Box>
        <DropdownMenuItem
          symbolLeft="binoculars.fill"
          external
          onSelect={() => window.open(explorerUrl, '_blank')}
        >
          {i18n.t('token_details.view_on', { explorer: explorerHost })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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

  const additionalDetails = getAdditionalDetails(tx);

  const backToHome = () =>
    navigate(ROUTES.HOME, {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });

  return (
    <BottomSheet show>
      <Navbar
        leftComponent={<Navbar.CloseButton onClick={backToHome} />}
        titleComponent={<ActivityPill transaction={tx} />}
        rightComponent={<MoreOptions transaction={tx} />}
      />
      <Separator color="separatorTertiary" />

      <Stack
        separator={<Separator color="separatorTertiary" />}
        padding="20px"
        gap="20px"
      >
        <ToFrom transaction={tx} />
        {additionalDetails && <AdditionalDetails details={additionalDetails} />}
        <ConfirmationData transaction={tx} />
        <NetworkData transaction={tx} />
        {tx.status === 'pending' && <SpeedUpOrCancel transaction={tx} />}
      </Stack>
    </BottomSheet>
  );
}
