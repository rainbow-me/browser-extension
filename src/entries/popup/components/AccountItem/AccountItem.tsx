import React from 'react';
import { Address } from 'wagmi';

import { supportedCurrencies } from '~/core/references';
import { selectUserAssetsBalance } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
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

import { useWalletName } from '../../hooks/useWalletName';
import { Asterisks } from '../Asterisks/Asterisks';
import { MenuItem } from '../Menu/MenuItem';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export enum LabelOption {
  address = 'address',
  balance = 'balance',
}

export default function AccountItem({
  account,
  rightComponent,
  onClick,
  labelType,
  isSelected,
  testId,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  labelType?: LabelOption;
  searchTerm?: string;
  testId?: string;
}) {
  const { displayName, showAddress } = useWalletName({ address: account });

  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { data: totalAssetsBalance } = useUserAssets(
    { address: account, currency, connectedToHardhat },
    { select: selectUserAssetsBalance() },
  );

  const userAssetsBalanceDisplay = convertAmountToNativeDisplay(
    totalAssetsBalance || 0,
    currency,
  );

  const { currentCurrency } = useCurrentCurrencyStore();
  const { hideAssetBalances } = useHideAssetBalancesStore();

  let labelComponent = null;
  if (labelType === LabelOption.address) {
    labelComponent = showAddress ? (
      <MenuItem.Label text={truncateAddress(account)} />
    ) : null;
  } else if (labelType === LabelOption.balance) {
    labelComponent = hideAssetBalances ? (
      <Inline alignVertical="center">
        <Text color="labelTertiary" size="12pt" weight="medium">
          {supportedCurrencies[currentCurrency]?.symbol}
        </Text>
        <Asterisks color="labelTertiary" size={10} />
      </Inline>
    ) : (
      <MenuItem.Label text={`${userAssetsBalanceDisplay}`} />
    );
  }

  return (
    <Lens
      handleOpenMenu={onClick}
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
            <WalletAvatar address={account} size={36} emojiSize="20pt" />
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
