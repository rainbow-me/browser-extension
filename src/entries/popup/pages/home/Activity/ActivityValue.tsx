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
import { formatNumber } from '~/core/utils/formatNumber';
import { Box, Text, TextOverflow } from '~/design-system';

const getSwapActivityValues = (transaction: RainbowTransaction) => {
  const { changes } = transaction;

  const tokenIn = changes.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes.filter((c) => c?.direction === 'out')[0]?.asset;

  if (!tokenIn || !tokenOut) return;

  const valueOut = `-${formatNumber(tokenOut.balance.amount)} ${
    tokenOut.symbol
  }`;
  const valueIn = `+${formatNumber(tokenIn.balance.amount)} ${tokenIn.symbol}`;

  return [valueOut, valueIn];
};

const getActivityValues = (transaction: RainbowTransaction) => {
  const { changes, direction, type } = transaction;

  if (['swap', 'wrap', 'unwrap'].includes(type))
    return getSwapActivityValues(transaction);

  const asset = changes.filter(
    (c) => c?.direction === direction && c?.asset.type !== 'nft',
  )[0]?.asset;
  const valueSymbol = direction === 'out' ? '-' : '+';

  if (!asset) return;

  const { balance, native } = asset;
  const assetValue = `${valueSymbol}${formatNumber(balance.amount)} ${
    asset.symbol
  }`;

  const nativeBalance = native.balance.amount;
  const assetNativeValue =
    +nativeBalance > 0
      ? `${valueSymbol}${formatNumber(nativeBalance)}`
      : i18n.t('activity.no_value');

  return +nativeBalance > 0
    ? [assetValue, assetNativeValue]
    : [assetNativeValue, assetValue];
};

export const ActivityValue = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const [topValue, bottomValue] = getActivityValues(transaction) ?? [];
  if (!topValue || !bottomValue) return null;

  const bottomValueColor = bottomValue.includes('+')
    ? 'green'
    : 'labelTertiary';

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="center"
      gap="8px"
    >
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {topValue}
      </Text>
      <TextOverflow
        size="14pt"
        weight="semibold"
        align="right"
        color={bottomValueColor}
      >
        {bottomValue}
      </TextOverflow>
    </Box>
  );
};
