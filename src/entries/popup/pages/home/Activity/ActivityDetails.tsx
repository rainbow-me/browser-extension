import { FixedNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import { motion } from 'framer-motion';
import { Navigate, useParams } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { RainbowTransaction, TxHash } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { copy, copyAddress } from '~/core/utils/copy';
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
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';
import { AddressOrEns } from '~/entries/popup/components/AddressOrEns/AddressorEns';
import { AssetContextMenu } from '~/entries/popup/components/AssetContextMenu';
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
import { WalletAvatar } from '~/entries/popup/components/WalletAvatar/WalletAvatar';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { SpeedUpAndCancelSheet } from '../../speedUpAndCancelSheet';
import { CopyableValue, InfoRow } from '../TokenDetails/About';

import { ActivityPill } from './ActivityPill';
import { getApprovalLabel } from './ActivityValue';
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
          onSelect={() => copyAddress(address)}
        >
          <Text size="14pt" weight="semibold">
            {i18n.t('token_details.more_options.copy_address')}
          </Text>
          <Text size="11pt" color="labelTertiary" weight="medium">
            {truncateAddress(address)}
          </Text>
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
      <Inline alignVertical="center" wrap={false} space="2px">
        <Text color="labelSecondary" size="12pt" weight="semibold">
          {i18n.t('activity_details.you')}
        </Text>

        <Inline alignVertical="center" wrap={false}>
          <Text size="12pt" weight="semibold" color="labelQuaternary">
            (
          </Text>
          <AddressOrEns
            address={address}
            size="12pt"
            weight="semibold"
            color="labelQuaternary"
          />
          <Text size="12pt" weight="semibold" color="labelQuaternary">
            )
          </Text>
        </Inline>
      </Inline>
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
    <Inline space="6px" alignVertical="center" wrap={false}>
      <WalletAvatar addressOrName={address} size={16} emojiSize="9pt" />
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
        <WalletAvatar addressOrName={address} size={16} emojiSize="9pt" />
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
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                  >
                    <Text size="12pt" weight="semibold" color="labelQuaternary">
                      {formatNumber(transaction.confirmations, {
                        notation: 'compact',
                      })}{' '}
                      {i18n.t('activity_details.confirmations')}
                    </Text>
                  </motion.div>
                )}
              </Inline>
            }
          />
        </>
      )}
    </Stack>
  );
}

const InfoValueSkeleton = () => <Skeleton width="50px" height="12px" />;
function FeeData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const { native, feeType } = tx;

  const maxPriorityFeePerGas =
    tx.maxPriorityFeePerGas && formatUnits(tx.maxPriorityFeePerGas, 'gwei');
  const maxFeePerGas = tx.maxFeePerGas && formatUnits(tx.maxFeePerGas, 'gwei');
  const baseFee = tx.baseFee && formatUnits(tx.baseFee, 'gwei');

  const gasPrice = tx.gasPrice && formatUnits(tx.gasPrice, 'gwei');

  return (
    <>
      {native?.fee && (
        <InfoRow
          symbol="fuelpump.fill"
          label={i18n.t('activity_details.fee')}
          value={formatCurrency(native.fee)}
        />
      )}
      {feeType === 'legacy' ? (
        <>
          {gasPrice && (
            <InfoRow
              symbol="barometer"
              label={i18n.t('activity_details.gas_price')}
              value={`${formatNumber(gasPrice)} Gwei`}
            />
          )}
        </>
      ) : (
        <>
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.base_fee')}
            value={
              baseFee ? `${formatNumber(baseFee)} Gwei` : <InfoValueSkeleton />
            }
          />
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.max_base_fee')}
            value={
              maxFeePerGas ? (
                `${formatNumber(maxFeePerGas)} Gwei`
              ) : (
                <InfoValueSkeleton />
              )
            }
          />
          <InfoRow
            symbol="barometer"
            label={i18n.t('activity_details.max_priority_fee')}
            value={
              maxPriorityFeePerGas ? (
                `${formatNumber(maxPriorityFeePerGas)} Gwei`
              ) : (
                <InfoValueSkeleton />
              )
            }
          />
        </>
      )}
    </>
  );
}

function NetworkData({ transaction: tx }: { transaction: RainbowTransaction }) {
  const { nonce, native } = tx;

  return (
    <Stack space="24px">
      {native?.value && +native?.value > 0 && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.value')}
          value={formatCurrency(native.value)}
        />
      )}
      <InfoRow
        symbol="point.3.filled.connected.trianglepath.dotted"
        label={i18n.t('activity_details.network')}
        value={
          <Inline alignVertical="center" space="4px">
            <ChainBadge chainId={tx.chainId} size={12} />
            {ChainNameDisplay[tx.chainId]}
          </Inline>
        }
      />
      <FeeData transaction={tx} />
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

export function ActivityDetails() {
  const { hash, chainId } = useParams<{ hash: TxHash; chainId: string }>();

  if (!chainId || !hash) return <Navigate to={ROUTES.HOME} />;

  return (
    <ActivityDetailsSheet hash={hash} chainId={chainId as unknown as ChainId} />
  );
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

  const fixedAmountIn = FixedNumber.fromString(amountIn);
  const fixedAmountOut = FixedNumber.fromString(amountOut);

  const rate = fixedAmountOut.divUnsafe(fixedAmountIn).toString();
  if (!rate) return;

  return `1 ${tokenIn.symbol} ≈ ${formatNumber(rate)} ${tokenOut.symbol}`;
};
const getAdditionalDetails = (transaction: RainbowTransaction) => {
  const exchangeRate = getExchangeRate(transaction);
  const { asset, changes, approvalAmount, contract, type } = transaction;
  const nft = changes?.find((c) => c?.asset.type === 'nft')?.asset;
  const collection = nft?.symbol;
  const standard = nft?.standard;
  const tokenContract =
    asset?.address !== ETH_ADDRESS && asset?.address !== AddressZero
      ? asset?.address
      : undefined;

  const tokenAmount =
    !nft && !exchangeRate && tokenContract
      ? changes?.find((c) => c?.asset.address === tokenContract)?.asset.balance
          .amount
      : undefined;

  const approval = type === 'approve' &&
    approvalAmount && {
      value: approvalAmount,
      label: getApprovalLabel(transaction),
    };

  if (
    !tokenAmount &&
    !tokenContract &&
    !exchangeRate &&
    !collection &&
    !standard &&
    !approval
  )
    return;

  return {
    asset,
    tokenAmount: tokenAmount && `${formatNumber(tokenAmount)} ${asset?.symbol}`,
    tokenContract,
    contract,
    exchangeRate,
    collection,
    standard,
    approval,
  };
};
type TxAdditionalDetails = ReturnType<typeof getAdditionalDetails>;

const AdditionalDetails = ({ details }: { details: TxAdditionalDetails }) => {
  const {
    asset,
    tokenAmount,
    tokenContract,
    exchangeRate,
    collection,
    standard,
    approval,
    contract,
  } = details || {};

  return (
    <Stack space="24px">
      {exchangeRate && (
        <InfoRow
          symbol="arrow.2.squarepath"
          label={i18n.t('activity_details.exchange_rate')}
          value={exchangeRate}
        />
      )}
      {contract?.name && (
        <InfoRow
          symbol="app.badge.checkmark"
          label={i18n.t('activity_details.app')}
          value={
            <Inline alignVertical="center" space="4px">
              {contract.iconUrl && (
                <ContractIcon size={16} iconUrl={contract.iconUrl} />
              )}
              {contract.name}
            </Inline>
          }
        />
      )}
      {tokenAmount && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.token')}
          value={
            <AssetContextMenu asset={asset}>
              <Inline alignVertical="center" space="4px">
                <CoinIcon asset={asset} badge={false} size={16} />
                {tokenAmount}
              </Inline>
            </AssetContextMenu>
          }
        />
      )}
      {approval && (
        <InfoRow
          symbol="dollarsign.square"
          label={i18n.t('activity_details.allowance')}
          value={
            approval.value === 'UNLIMITED' ? (
              <Inline alignVertical="center" space="4px">
                <Text color="orange" size="12pt" weight="semibold">
                  {i18n.t('activity_details.unlimited_allowance', {
                    symbol: asset?.symbol,
                  })}
                </Text>
                <Symbol
                  weight="semibold"
                  symbol="exclamationmark.triangle"
                  size={12}
                  color="orange"
                />
              </Inline>
            ) : (
              approval.label
            )
          }
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
          onSelect={() =>
            copy({
              value: hash,
              title: i18n.t('activity_details.hash_copied'),
              description: truncateString(hash, 18),
            })
          }
        >
          <Text size="14pt" weight="semibold">
            {i18n.t('activity_details.copy_hash')}
          </Text>
          <TextOverflow size="11pt" color="labelTertiary" weight="medium">
            {hash}
          </TextOverflow>
        </DropdownMenuItem>
        {explorerUrl && (
          <DropdownMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => {
              copy({
                title: i18n.t('activity_details.explorer_copied'),
                description: truncateString(explorerUrl, 18),
                value: explorerUrl,
              });
            }}
          >
            <Text size="14pt" weight="semibold">
              {i18n.t('activity_details.copy_explorer_url')}
            </Text>
            <TextOverflow size="11pt" color="labelTertiary" weight="medium">
              {explorerUrl}
            </TextOverflow>
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
  hash: TxHash;
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
    <BottomSheet zIndex={zIndexes.ACTIVITY_DETAILS} show>
      <Navbar
        leftComponent={<Navbar.CloseButton onClick={backToHome} withinModal />}
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
