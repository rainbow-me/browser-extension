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

import { formatUnits } from '@ethersproject/units';

import { i18n } from '~/core/languages';
import { RainbowTransaction } from '~/core/types/transactions';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { Box, Text, TextOverflow } from '~/design-system';

const approvalTypeValues = (transaction: RainbowTransaction) => {
  const { asset, approvalAmount } = transaction;

  if (!asset || !approvalAmount) return;

  let label;
  if (approvalAmount === 'UNLIMITED') label = i18n.t('approvals.unlimited');
  else if (transaction.type === 'revoke')
    label = i18n.t('approvals.no_allowance');
  else
    label = `${formatNumber(formatUnits(approvalAmount, asset.decimals))} ${
      asset.symbol
    }`;

  return [
    null, // protocol name and icon goes here, when backend get this data
    label && (
      <Box
        key="approval"
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

  const assetValue = `${formatNumber(balance.amount)} ${asset.symbol}`;

  const nativeBalance = native.balance.amount;
  const assetNativeValue =
    +nativeBalance > 0
      ? `${valueSymbol}${formatCurrency(nativeBalance)}`
      : i18n.t('activity.no_value');

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
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="center"
      gap="8px"
    >
      {topValue && (
        <Text color="labelTertiary" size="12pt" weight="semibold">
          {topValue}
        </Text>
      )}
      {typeof bottomValue === 'string' ? (
        <TextOverflow
          size="14pt"
          weight="semibold"
          align="right"
          color={bottomValue.includes('+') ? 'green' : 'labelTertiary'}
        >
          {bottomValue}
        </TextOverflow>
      ) : (
        bottomValue
      )}
    </Box>
  );
};
