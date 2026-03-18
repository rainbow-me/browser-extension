import { capitalize } from 'lodash';

import { i18n } from '~/core/languages';
import { ChainId, chainIdToNameMapping } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { isParsedUserAsset } from '~/core/utils/assets';
import { formatCurrency, formatNumber } from '~/core/utils/formatNumber';
import { getApprovalLabel } from '~/core/utils/transactions';

export type SwapDisplayValues = {
  type: 'swap';
  outValue: string;
  inValue: string;
};

export type BridgeDisplayValues = {
  type: 'bridge';
  chainId: ChainId;
  chainName: string;
  inValue: string;
};

export type ApprovalDisplayValues = {
  type: 'approval';
  contractName?: string;
  contractIconUrl?: string;
  label?: string;
};

export type TransferDisplayValues = {
  type: 'transfer';
  topValue: string;
  bottomValue: string;
};

export type ActivityDisplayValues =
  | SwapDisplayValues
  | BridgeDisplayValues
  | ApprovalDisplayValues
  | TransferDisplayValues;

const swapValues = (
  changes: RainbowTransaction['changes'],
): SwapDisplayValues | undefined => {
  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;
  if (!tokenIn || !tokenOut || !tokenIn.symbol || !tokenOut.symbol) return;

  return {
    type: 'swap',
    outValue: `-${formatNumber(tokenOut.balance.amount)} ${tokenOut.symbol}`,
    inValue: `+${formatNumber(tokenIn.balance.amount)} ${tokenIn.symbol}`,
  };
};

const bridgeValues = (
  changes: RainbowTransaction['changes'],
): BridgeDisplayValues | undefined => {
  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;
  if (!tokenIn || !tokenOut) return;

  const chainName = chainIdToNameMapping[tokenIn.chainId];

  return {
    type: 'bridge',
    chainId: tokenIn.chainId,
    chainName: chainName ? capitalize(chainName) : 'Unknown',
    inValue: `+${formatNumber(tokenIn.balance.amount)} ${tokenIn.symbol}`,
  };
};

const approvalValues = (
  transaction: RainbowTransaction,
): ApprovalDisplayValues | undefined => {
  const { asset, approvalAmount, contract } = transaction;
  if (!asset || !approvalAmount) return;

  return {
    type: 'approval',
    contractName: contract?.name,
    contractIconUrl: contract?.iconUrl,
    label: getApprovalLabel(transaction),
  };
};

const transferValues = (
  transaction: RainbowTransaction,
): TransferDisplayValues | undefined => {
  const { changes, direction } = transaction;

  const filteredChanges = changes?.filter((c) => c?.asset.type !== 'nft');

  // prefer "out"/"in" changes over "self" — self changes (e.g. contract
  // returning funds) are low-priority and only shown as a last resort
  const nonSelfChanges = filteredChanges?.filter(
    (c) => c?.direction !== 'self',
  );
  const change =
    nonSelfChanges?.find((c) => c?.direction === direction) ?? // prefer change matching transaction direction
    (nonSelfChanges?.length === 1 ? nonSelfChanges[0] : undefined) ?? // or take the only change that's not a self transfer
    (filteredChanges?.length === 1 ? filteredChanges[0] : undefined); // fallback to self transfer if no other changes

  const asset = change?.asset;
  if (!asset || !isParsedUserAsset(asset) || !asset.symbol) return;

  const resolvedDirection = change?.direction ?? direction; // prefer change direction for value display
  const { balance, native } = asset;

  const valueSymbol =
    balance.amount === '0' ? '' : resolvedDirection === 'in' ? '+' : '-';

  const formatOptions =
    +balance.amount > 100_000 ? ({ notation: 'compact' } as const) : undefined;
  const assetValue = `${formatNumber(balance.amount, formatOptions)} ${
    asset.symbol
  }`;

  const nativeBalance = native.balance.amount;
  const nativeValue =
    +nativeBalance > 0
      ? `${valueSymbol}${formatCurrency(nativeBalance)}`
      : i18n.t('activity.no_value');

  return +nativeBalance > 0
    ? { type: 'transfer', topValue: assetValue, bottomValue: nativeValue }
    : {
        type: 'transfer',
        topValue: nativeValue,
        bottomValue: `${valueSymbol}${assetValue}`,
      };
};

export const getActivityDisplayValues = (
  transaction: RainbowTransaction,
): ActivityDisplayValues | undefined => {
  const { changes, type } = transaction;

  if (['swap', 'wrap', 'unwrap'].includes(type)) return swapValues(changes);
  if (type === 'bridge' && changes?.length === 2) return bridgeValues(changes);
  if (['approve', 'revoke'].includes(type)) return approvalValues(transaction);

  return transferValues(transaction);
};
