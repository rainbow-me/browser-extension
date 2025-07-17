/*
  when tx type is SWAP, WRAP, UNWRAP
  values are token out on top and token in on bottom

  when tx type is BRIDGE
  values are "to <network_name>" on top and bridge value on bottom

  when tx type is APPROVE
  values are contract name and symbol on top and approved amount on bottom

  when tx type is STAKE or UNSTAKE
  protocol name and symbol on top, and staked/unstake token amount on bottom

  ALL OTHER TX TYPES
  if direction out, token amount out on top and it's native amount on bottom
  if direction in, the same but with token in amounts
  if native amount is 0, show no value on top and token amount on bottom
*/

import { i18n } from '~/core/languages';
import { RainbowTransaction } from '~/core/types/transactions';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { getApprovalLabel } from '~/core/utils/transactions';
import { Box, Inline, Text, TextOverflow } from '~/design-system';
import { ContractIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';

const approvalTypeValues = (transaction: RainbowTransaction) => {
  const { asset, approvalAmount, hash, contract } = transaction;

  if (!asset || !approvalAmount) return;
  const label = getApprovalLabel(transaction);

  return [
    contract?.name ? (
      <Inline key={`app${hash}`} alignVertical="center" space="4px">
        {contract.iconUrl && (
          <ContractIcon size={16} iconUrl={contract.iconUrl} />
        )}
        {contract.name}
      </Inline>
    ) : null,
    label && (
      <Box
        key={`approval${hash}`}
        paddingHorizontal="6px"
        paddingVertical="5px"
        borderColor="separatorSecondary"
        borderRadius="6px"
        borderWidth="1px"
        style={{ borderStyle: 'dashed' }}
      >
        <Text size="11pt" weight="semibold" color="labelTertiary">
          {label}
        </Text>
      </Box>
    ),
  ];
};

const swapTypeValues = (changes: RainbowTransaction['changes']) => {
  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;

  if (!tokenIn || !tokenOut) return;

  const valueOut = `-${formatNumber(tokenOut.balance.amount)} ${
    tokenOut.symbol
  }`;
  const valueIn = `+${formatNumber(tokenIn.balance.amount)} ${tokenIn.symbol}`;

  return [valueOut, valueIn];
};

const SUPER_TINY_THRESHOLD = 0.000001 as const;

const isSuperTinyValue = (amount: string): boolean => {
  const num = Number(amount);
  return num > 0 && num < SUPER_TINY_THRESHOLD;
};

const getFormatOptions = (amount: string): Intl.NumberFormatOptions => {
  const num = Number(amount);
  return num > 100_000 ? { notation: 'compact' } : {};
};

const activityValues = (transaction: RainbowTransaction) => {
  const { changes, direction, type } = transaction;
  if (['swap', 'wrap', 'unwrap'].includes(type)) return swapTypeValues(changes);
  if (['approve', 'revoke'].includes(type))
    return approvalTypeValues(transaction);

  const asset = changes?.filter(
    (c) => c?.direction === direction && c?.asset.type !== 'nft',
  )[0]?.asset;
  const valueSymbol = direction === 'out' ? '-' : '+';

  if (!asset) return;

  const { balance, native } = asset;
  if (balance.amount === '0') return;

  const assetValue = isSuperTinyValue(balance.amount)
    ? `<${formatNumber(SUPER_TINY_THRESHOLD)} ${asset.symbol}`
    : `${formatNumber(balance.amount, getFormatOptions(balance.amount))} ${
        asset.symbol
      }`;

  const nativeBalance = native.balance.amount;
  let assetNativeValue: string;
  if (isSuperTinyValue(nativeBalance)) {
    assetNativeValue = `${valueSymbol} <${formatCurrency(
      String(SUPER_TINY_THRESHOLD),
    )}`;
  } else if (+nativeBalance > 0) {
    assetNativeValue = `${valueSymbol}${formatCurrency(nativeBalance)}`;
  } else {
    assetNativeValue = i18n.t('activity.no_value');
  }

  return +nativeBalance > 0
    ? [assetValue, assetNativeValue]
    : [assetNativeValue, `${valueSymbol}${assetValue}`];
};

export const ActivityValue = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const [topValue, bottomValue] = activityValues(transaction) ?? [];
  if (!topValue && !bottomValue) return null;

  return (
    <Box
      display="flex"
      flexShrink="0"
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="center"
      gap="8px"
    >
      {topValue && (
        <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
          {topValue}
        </TextOverflow>
      )}
      {typeof bottomValue === 'string' ? (
        <TextOverflow
          size="14pt"
          weight="semibold"
          align="right"
          color={bottomValue.includes('+') ? 'green' : 'labelSecondary'}
        >
          {bottomValue}
        </TextOverflow>
      ) : (
        bottomValue
      )}
    </Box>
  );
};
