import React from 'react';
import { Address, useBalance } from 'wagmi';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
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
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';

import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
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
  rowHighlight,
}: {
  account: Address;
  rightComponent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  labelType?: LabelOption;
  searchTerm?: string;
  rowHighlight?: boolean;
}) {
  const { displayName, showAddress } = useWalletName({ address: account });
  const { data: balance } = useBalance({ addressOrName: account });
  const nativeAsset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });
  const { currentCurrency } = useCurrentCurrencyStore();
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const nativeDisplay = convertAmountAndPriceToNativeDisplay(
    balance?.formatted || 0,
    nativeAsset?.native?.price?.amount || 0,
    currentCurrency,
  );

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
      <MenuItem.Label text={`${nativeDisplay?.display}`} />
    );
  }

  return (
    <Lens
      className={rowHighlight ? rowTransparentAccentHighlight : undefined}
      handleOpenMenu={onClick}
      key={account}
      onClick={onClick}
      paddingHorizontal="14px"
      paddingVertical="10px"
      borderRadius="12px"
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
