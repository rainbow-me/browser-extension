import React, { useCallback } from 'react';
import { Address } from 'viem';

import { supportedCurrencies } from '~/core/references';
import {
  selectUserAssetsBalance,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';

import { useWalletName } from '../../hooks/useWalletName';
import { Asterisks } from '../Asterisks/Asterisks';
import { MenuItem } from '../Menu/MenuItem';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export enum LabelOption {
  address = 'address',
  balance = 'balance',
}

const TotalAssetsBalance = ({ account }: { account: Address }) => {
  const { hidden } = useHiddenAssetStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { currentAddress: address } = useCurrentAddressStore();
  const isHidden = useCallback(
    (asset: ParsedUserAsset) => {
      return !!hidden[address]?.[computeUniqueIdForHiddenAsset(asset)];
    },
    [address, hidden],
  );
  const { data: totalAssetsBalance, isLoading } = useUserAssets(
    { address: account, currency },
    {
      select: (data) =>
        selectorFilterByUserChains<string>({
          data,
          selector: (assetsByChain) => {
            return selectUserAssetsBalance(assetsByChain, isHidden);
          },
        }),
    },
  );
  const userAssetsBalanceDisplay = convertAmountToNativeDisplay(
    totalAssetsBalance || '0',
    currency,
  );

  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  if (hideAssetBalances)
    return (
      <Inline alignVertical="center">
        <Text color="labelTertiary" size="12pt" weight="medium">
          {supportedCurrencies[currentCurrency]?.symbol}
        </Text>
        <Asterisks color="labelTertiary" size={10} />
      </Inline>
    );
  if (isLoading) return <Skeleton height="12px" width="60px" />;

  return <MenuItem.Label text={`${userAssetsBalanceDisplay}`} />;
};

export default function AccountItem({
  account,
  rightComponent,
  onClick,
  onContextMenu,
  labelType,
  isSelected,
  testId,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  isSelected?: boolean;
  labelType?: LabelOption;
  searchTerm?: string;
  testId?: string;
}) {
  const { displayName, showAddress } = useWalletName({ address: account });

  let labelComponent = null;
  if (labelType === LabelOption.address) {
    labelComponent = showAddress ? (
      <MenuItem.Label text={truncateAddress(account)} />
    ) : null;
  } else if (labelType === LabelOption.balance) {
    labelComponent = <TotalAssetsBalance account={account} />;
  }

  return (
    <Lens
      handleOpenMenu={onClick}
      onContextMenu={onContextMenu}
      key={account}
      onClick={onClick}
      paddingHorizontal="14px"
      paddingVertical="10px"
      borderRadius="12px"
      testId={testId}
    >
      <Columns space="8px" alignVertical="center" alignHorizontal="justify">
        <Column width="content">
          <Box
            testId={`account-item-${displayName}`}
            height="fit"
            position="relative"
          >
            {isSelected && (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  zIndex: 1,
                  bottom: -4,
                  left: -4,
                }}
                position="absolute"
                padding="3px"
                borderRadius="round"
                background="surfacePrimaryElevated"
                alignItems="center"
                justifyContent="center"
              >
                <Symbol
                  symbol="checkmark.circle.fill"
                  color="accent"
                  weight="bold"
                  size={14}
                />
              </Box>
            )}
            <WalletAvatar addressOrName={account} size={36} emojiSize="20pt" />
          </Box>
        </Column>
        <Column>
          <Box>
            <Rows space="8px" alignVertical="center">
              <Row height="content">
                <MenuItem.Title text={displayName || ''} />
              </Row>
              {labelComponent && <Row height="content">{labelComponent}</Row>}
            </Rows>
          </Box>
        </Column>
        <Column width="content">
          <Box>{rightComponent}</Box>
        </Column>
      </Columns>
    </Lens>
  );
}
